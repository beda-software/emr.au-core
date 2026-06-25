import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    getAuthorizeUrl,
    OAuthState,
    setAuthClientRedirectURL,
    setAuthTokenURLpath,
} from '@beda.software/emr/services';
import config from '@beda.software/emr-config';

import { authProvidersConfig } from './authProvidersConfig';
import { AuthProvider, saveAuthProviderToStorage, Tier } from 'src/services/auth';
import { setBaseUrl, setClientId, setFhirBaseUrl } from 'src/services/storage';

export interface SignInProps {
    originPathName?: string;
    onSwitchService?: (authProvider: AuthProvider) => void;
}

export function useSignIn(props: SignInProps) {
    const [activeAuthProvider, setAuthProvider] = useState<AuthProvider>(AuthProvider.AuCoreAidbox);
    const providerConfig = useMemo(() => authProvidersConfig[activeAuthProvider], [activeAuthProvider]);
    const tierConfig = providerConfig.tier;
    const authClientConfig = providerConfig.client;
    const tier = config.tier as Tier;

    useEffect(() => {
        setBaseUrl(tierConfig[tier].baseUrl);
        setFhirBaseUrl(tierConfig[tier].fhirBaseUrl);
        setClientId(authClientConfig.clientId);
        setAuthClientRedirectURL(authClientConfig.redirectURL);
        setAuthTokenURLpath(authClientConfig.tokenPath);
        saveAuthProviderToStorage(activeAuthProvider);
        if (props.onSwitchService) {
            props.onSwitchService(activeAuthProvider);
        }
    }, [props, authClientConfig, tierConfig, tier, activeAuthProvider]);

    const authorize = useCallback(() => {
        const { signIn } = providerConfig;

        if (signIn.type === 'mock-token') {
            window.localStorage.setItem('token', signIn.token);
            window.location.href = signIn.redirectPath ?? '/patients';
            return;
        }

        if (signIn.type === 'presaved-token') {
            window.localStorage.setItem('token', localStorage['presavedToken']);
            window.location.href = signIn.redirectPath ?? '/patients';
            return;
        }

        const authState: OAuthState | undefined = props.originPathName ? { nextUrl: props.originPathName } : undefined;

        window.location.href = getAuthorizeUrl({
            baseUrl: tierConfig[tier].baseUrl,
            authPath: authClientConfig.authPath,
            params: new URLSearchParams({
                client_id: authClientConfig.clientId,
                response_type: authClientConfig.responseType,
                redirect_uri: authClientConfig.redirectURL,
                ...(authClientConfig.scope ? { scope: authClientConfig.scope.join(' ') } : {}),
            }),
            state: authState,
        });
    }, [props.originPathName, authClientConfig, tierConfig, tier, providerConfig]);

    return { activeAuthProvider, authorize, setAuthProvider, authClientConfig };
}
