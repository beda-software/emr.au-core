import { decodeJwt, JWTPayload } from 'jose';

import { InternalReference, Patient, Practitioner, User } from '@beda.software/aidbox-types';
import { fetchUserRoleDetails, aidboxPopulateUserInfoSharedState } from '@beda.software/emr/dist/containers/App/utils';
import { getIdToken } from '@beda.software/emr/services';
import { sharedAuthorizedUser } from '@beda.software/emr/sharedState';
import { failure, RemoteDataResult, success } from '@beda.software/remote-data';

import { AuthProvider } from 'src/services/auth';

export interface SmileIdTokenData extends JWTPayload {
    fhirUser: string; //e.g "null/Practitioner/<practitioner-id>"
}
export async function smileUserInfoSharedState(): Promise<RemoteDataResult<User>> {
    const idToken = getIdToken();

    if (!idToken) {
        return failure({ error: 'id_token is not provided' });
    }

    const { fhirUser } = decodeJwt(idToken) as SmileIdTokenData;
    const fhirUserData = fhirUser.split('/').slice(1);
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
export const clientSharedUserInitService: { [key in AuthProvider]: SharedUserInitCallback | undefined } = {
    [AuthProvider.AuCoreAidbox]: aidboxPopulateUserInfoSharedState,
    [AuthProvider.ErequestingAidbox]: aidboxPopulateUserInfoSharedState,
    [AuthProvider.SmartOnFhirAidbox]: aidboxPopulateUserInfoSharedState,
    [AuthProvider.SparkedHAPI]: smileUserInfoSharedState,
};
