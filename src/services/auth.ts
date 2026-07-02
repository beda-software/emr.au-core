import { AuthProvider } from 'src/containers/SignIn/authProvidersConfig';

export {
    AuthProvider,
    authProvidersConfig,
    type AuthClientConfigParams,
    type AuthProviderConfig,
    type SharedAccountDetails,
    type SharedCredentials,
    type SignInStrategy,
    type UserInitStrategy,
} from 'src/containers/SignIn/authProvidersConfig';

export function saveAuthProviderToStorage(value: AuthProvider) {
    window.localStorage.setItem('auth_provider', value);
}

export function getAuthProviderFromStorage() {
    const authProvider = window.localStorage.getItem('auth_provider');

    if (authProvider) {
        return authProvider as AuthProvider;
    }

    return null;
}
