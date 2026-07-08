import { useEffect, useMemo, useState } from 'react';

import { axiosInstance, getToken } from '@beda.software/emr/services';

import { clientSharedUserInitService } from 'src/populateUserInfoSharedState';
import { AuthProvider, authProvidersConfig, getAuthProviderFromStorage } from 'src/services/auth';


export function useApp() {
    const [authProvider, setAuthProvider] = useState<AuthProvider | null>(getAuthProviderFromStorage());
    const sharedUserInitService = useMemo(
        () => (authProvider ? clientSharedUserInitService[authProvider] : undefined),
        [authProvider],
    );

    useEffect(() => {
        if (authProvider) {
            const provider = authProvidersConfig[authProvider];
            if (provider.client.headers){
                const defaultHeaders = axiosInstance.defaults.headers;
                axiosInstance.defaults.headers = {
                    ...defaultHeaders,
                    ...provider.client.headers,
                }
            }
        }

        const authProviderHeader = document.getElementById('auth-provider-info');
        if (authProviderHeader) {
            const token = getToken();
            if (!token) {
                authProviderHeader.style.display = 'none';
            }
        }
    }, []);

    return { sharedUserInitService, setAuthProvider };
}
