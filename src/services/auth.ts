import { AuthProvider } from 'src/containers/SignIn/authProvidersConfig';

export {
    AuthProvider,
    authClientConfigMap,
    authProvidersConfig,
    tierConfigMap,
    type AuthClientConfigParams,
    type AuthProviderConfig,
    type SharedAccountDetails,
    type SharedCredentials,
    type SignInStrategy,
    type Tier,
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
