import { decodeJwt, JWTPayload } from 'jose';

import { InternalReference, Patient, Practitioner, User } from '@beda.software/aidbox-types';
import { aidboxPopulateUserInfoSharedState, fetchUserRoleDetails } from '@beda.software/emr/dist/containers/App/utils';
import { getIdToken } from '@beda.software/emr/services';
import {
    sharedAuthorizedPractitioner,
    sharedAuthorizedPractitionerRoles,
    sharedAuthorizedUser,
} from '@beda.software/emr/sharedState';
import config from '@beda.software/emr-config';
import { failure, RemoteDataResult, success } from '@beda.software/remote-data';

import { authProvidersConfig } from 'src/containers/SignIn/authProvidersConfig';
import { AuthProvider, tierConfigMap } from 'src/services/auth';

export interface SmileIdTokenData extends JWTPayload {
    fhirUser: string; //e.g "null/Practitioner/<practitioner-id>"
}

const mockUserInfoSharedState = (practitionerId: string) => async (): Promise<RemoteDataResult<User>> => {
    const user: User = {
        resourceType: 'User',
        id: 'user',
        fhirUser: {
            resourceType: 'Practitioner',
            id: practitionerId,
        },
        role: [
            {
                resourceType: 'Role',
                name: 'practitioner',
                user: { resourceType: 'User', id: 'user' },
                links: { practitioner: { resourceType: 'Practitioner', id: practitionerId } },
            },
        ],
    };
    sharedAuthorizedUser.setSharedState(user);

    if (config.baseURL === tierConfigMap[AuthProvider.OrionHealth].develop.baseUrl) {
        sharedAuthorizedPractitioner.setSharedState({ resourceType: 'Practitioner', id: practitionerId });
        sharedAuthorizedPractitionerRoles.setSharedState([]);
    } else {
        await fetchUserRoleDetails(user);
    }

    return success(user);
};

export async function smileUserInfoSharedState(): Promise<RemoteDataResult<User>> {
    const idToken = getIdToken();

    if (!idToken) {
        return failure({ error: 'id_token is not provided' });
    }

    const { fhirUser } = decodeJwt(idToken) as SmileIdTokenData;

    const fhirUserData = fhirUser.split('/').slice(-2);
    const fhirUserRef: InternalReference<Patient | Practitioner> = {
        resourceType: fhirUserData[0] as 'Practitioner' | 'Patient',
        id: fhirUserData[1],
    };

    const user: User = {
        resourceType: 'User',
        id: fhirUserRef.id,
        fhirUser: fhirUserRef,
        role: [
            {
                resourceType: 'Role',
                name: fhirUserRef.resourceType === 'Practitioner' ? 'practitioner' : 'patient',
                user: { resourceType: 'User', id: fhirUserRef.id },
                links: {
                    ...(fhirUserRef.resourceType === 'Practitioner'
                        ? { practitioner: { resourceType: fhirUserRef.resourceType, id: fhirUserRef.id } }
                        : { patient: { resourceType: fhirUserRef.resourceType, id: fhirUserRef.id } }),
                },
            },
        ],
    };
    sharedAuthorizedUser.setSharedState(user);
    await fetchUserRoleDetails(user);

    return success(user);
}

export type SharedUserInitCallback = () => Promise<RemoteDataResult<User>>;

function resolveUserInitService(userInit: (typeof authProvidersConfig)[AuthProvider]['userInit']): SharedUserInitCallback {
    switch (userInit.type) {
        case 'aidbox':
            return aidboxPopulateUserInfoSharedState;
        case 'smile':
            return smileUserInfoSharedState;
        case 'mock':
            return mockUserInfoSharedState(userInit.practitionerId);
    }
}

export const clientSharedUserInitService: { [key in AuthProvider]: SharedUserInitCallback } = Object.fromEntries(
    Object.entries(authProvidersConfig).map(([provider, providerConfig]) => [
        provider,
        resolveUserInitService(providerConfig.userInit),
    ]),
) as { [key in AuthProvider]: SharedUserInitCallback };
