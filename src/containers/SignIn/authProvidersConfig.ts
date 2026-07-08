import config from '@beda.software/emr-config/config';

export enum AuthProvider {
    AuCoreAidbox = 'au-core-aidbox',
    ErequestingAidbox = 'e-requesting-aidbox',
    ErequestingSparked = 'e-requesting-sparked',
    ErequestingCallistemon = 'e-requesting-callistemon',
    SmartOnFhirAidbox = 'smart-on-fhir-aidbox',
    SparkedHAPI = 'sparked-hapi',
    BP = 'best-practice',
    IRIS = 'isris',
    MediRecords = 'medirecords',
    HaloConnect = 'halo-connect',
    MedtechGlobal = 'medtech-global',
    Sparked = 'sparked',
    DigitalHealth = 'digital-health',
    Epic = 'epic',
    OrionHealth = 'orion-health',
    EpicEU = 'epic-eu',
    MeditechEU = 'meditech-eu',
    Nuvyta = 'Nuvyta',
    fhirworks = 'fhirworks',
    elitemx = 'elitemx'
}

export interface SharedCredentials {
    accountDetails: SharedAccountDetails[];
    commonPassword?: string;
}

export interface SharedAccountDetails {
    login: string;
    accountDescription: string;
    password?: string;
}

export interface AuthClientConfigParams {
    clientId: string;
    authPath: string;
    tokenPath: string;
    responseType: 'code' | 'token';
    redirectURL: string;
    grantType: 'implicit' | 'authorization_code' | 'client_credentials';
    scope?: string[];
    tabTitle: string;
    message: string;
    sharedCredentials?: SharedCredentials;
    headers?: { [key in string]: string };
}

export type SignInStrategy =
    | { type: 'oauth' }
    | { type: 'mock-token'; token: string; redirectPath?: string }
    | { type: 'presaved-token'; redirectPath?: string };

export type UserInitStrategy =
    | { type: 'aidbox' }
    | { type: 'smile' }
    | { type: 'mock'; practitionerId: string };

export interface AuthProviderConfig {
    baseUrl: string;
    fhirBaseUrl: string;
    client: AuthClientConfigParams;
    signIn: SignInStrategy;
    userInit: UserInitStrategy;
}

const aidboxSharedCredentials: SharedCredentials = {
    accountDetails: [
        {
            login: 'alderson-helene',
            accountDescription: 'Practitioner has access to related patients',
        },
    ],
    commonPassword: 'password',
};

const aidboxClientConfig = (tabTitle: string): AuthClientConfigParams => ({
    clientId: config.tier === 'production' ? 'web' : 'web-local',
    authPath: 'auth/authorize',
    tokenPath: 'auth/token',
    responseType: 'token',
    redirectURL: `${window.location.origin}/auth-aidbox`,
    grantType: 'implicit',
    tabTitle,
    message: 'On the next page, please, use one of the following credentials',
    sharedCredentials: aidboxSharedCredentials,
});

const smartOAuthClientConfig = (
    tabTitle: string,
    options: {
        clientId: string;
        redirectURL: string;
        message?: string;
        headers?: { [key in string]: string };
        tokenPath?: string;
    },
): AuthClientConfigParams => ({
    clientId: options.clientId,
    authPath: 'smart/oauth/authorize',
    tokenPath: options.tokenPath ?? 'smart/oauth/token',
    responseType: 'code',
    redirectURL: options.redirectURL,
    grantType: 'authorization_code',
    scope: ['openid', 'fhirUser'],
    tabTitle,
    message: options.message ?? 'No authorization required',
    ...(options.headers ? { headers: options.headers } : {}),
});

const EPIC_MOCK_TOKEN =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ1cm46QUNUSDpDRUIsImNsaWVudF9pZCI6IkNPTk5FQ1RUSE9OLTIwMjYwMzExIiwiZXBpYy5lY2kiOiJ1cm46ZXBpYzpBdXN0cmFsaWEtQ29ubmVjdGF0aG9uIiwiZXBpYy5tZXRhZGF0YSI6IkE5aGxFXy1hZWk3OG9QOFhlSUFHN042X0xfYzg1VHU4a3VOSHRoVmRGdHJxNllUU0J0QlNsWmZfSDc4V3JZRmJ3bEh3NGtFa19PRUlMQUZwbl8xaXVuTnRwdld6UTROUzRxdlhoUElxdmJITkhDbVRybktQQTBQSTBTZERmb0EyIiwiZXBpYy50b2tlbnR5cGUiOiJhY2Nlc3MiLCJleHAiOjE3NzMxODM3OTEsImlhdCI6MTc3MzA5NzQwMSwiaXNzIjoidXJuOkFDVEg6Q0UiLCJqdGkiOiIyNjZmM2M2Yi0yZTVkLTQ1ZGQtYTUwYS0wY2VjYjcxOGU4OTkiLCJuYmYiOjE3NzMwOTc0MDEsInN1YiI6ImVtM1doWVJZR1RiTzltb3cwc2ducWlnMyJ9.bxoOzev5pctdoYbnGjpv_Uw5pAphCQ3ruvAkDBzgLcgrNoE_Aq6d7VhWpRGfgkaVeSfM4b4ElmXZZsyuCXzftzDdyUA_M18D4cGEhtnRQLzlG1x4gd9w8pQ4bXitU-Gwv8qgI44juHXnJZzOLMngSvfM44gD5CExmu5jWMkbZ7IN87bTIoVaWxmkdXvK31F0hN1UVGaYf6SadHWevNjGyFOz3C3r04bdBmyiw3idhR0tfhAaVxNQznVYOuygrE5pgJYPVl7ZtgMXr-fGE7FF61t-nRnpHtMFW3WUJQ278eN8gGRtrbVQDId6YS7Xyz7ufseQI8F4s2UcxqRYSJBDFg';

const MEDTECH_GLOBAL_MOCK_TOKEN =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjVPZjlQNUY5Z0NDd0NtRjJCT0hIeEREUS1EayIsImtpZCI6IjVPZjlQNUY5Z0NDd0NtRjJCT0hIeEREUS1EayJ9';

export const authProvidersConfig: { [key in AuthProvider]: AuthProviderConfig } = {
    [AuthProvider.AuCoreAidbox]: {
        baseUrl: 'https://aucore.aidbox.beda.software',
        fhirBaseUrl: 'https://aucore.aidbox.beda.software/fhir',
        client: aidboxClientConfig('aucore.aidbox.beda.software'),
        signIn: { type: 'oauth' },
        userInit: { type: 'aidbox' },
    },
    [AuthProvider.ErequestingAidbox]: {
        baseUrl: 'https://erequesting.aidbox.beda.software',
        fhirBaseUrl: 'https://erequesting.aidbox.beda.software/fhir',
        client: aidboxClientConfig('erequesting.aidbox.beda.software'),
        signIn: { type: 'oauth' },
        userInit: { type: 'aidbox' },
    },
    [AuthProvider.ErequestingSparked]: {
        baseUrl: 'https://smile.sparked-fhir.com/ereq',
        fhirBaseUrl: 'https://smile.sparked-fhir.com/ereq/fhir/DEFAULT',
        client: {
            clientId: 'beda-emr',
            authPath: 'smartauth/oauth/authorize',
            tokenPath: 'smartauth/oauth/token',
            responseType: 'code',
            redirectURL: `${window.location.origin}/auth`,
            grantType: 'authorization_code',
            tabTitle: 'smile.sparked-fhir.com/ereq',
            message: 'Please contact https://github.com/aehrc/sparked-fhir-server-configuration for credentials',
        },
        signIn: { type: 'oauth' },
        userInit: { type: 'smile' },
    },
    [AuthProvider.ErequestingCallistemon]: {
        baseUrl: 'https://server.callistemon.site/fhir',
        fhirBaseUrl: 'https://server.callistemon.site/fhir',
        client: {
            clientId: 'callistemon',
            authPath: 'smart/oauth/authorize',
            tokenPath: 'smart/oauth/token',
            responseType: 'code',
            redirectURL: `${window.location.origin}/callistemon-auth`,
            grantType: 'authorization_code',
            scope: ['openid', 'fhirUser'],
            tabTitle: 'eRequesting Callistemon (HAPI server)',
            message: 'No authorization required',
        },
        signIn: { type: 'mock-token', token: 'token' },
        userInit: { type: 'mock', practitionerId: '1153' },
    },
    [AuthProvider.SmartOnFhirAidbox]: {
        baseUrl: 'https://smartonfhir.aidbox.beda.software',
        fhirBaseUrl: 'https://smartonfhir.aidbox.beda.software/fhir',
        client: aidboxClientConfig('smartonfhir.aidbox.beda.software'),
        signIn: { type: 'oauth' },
        userInit: { type: 'aidbox' },
    },
    [AuthProvider.SparkedHAPI]: {
        baseUrl: 'https://fhir.hl7.org.au/aucore',
        fhirBaseUrl: 'https://fhir.hl7.org.au/aucore/fhir/DEFAULT',
        client: {
            clientId: 'beda-emr',
            authPath: 'smart/oauth/authorize',
            tokenPath: 'smart/oauth/token',
            responseType: 'code',
            redirectURL: `${window.location.origin}/auth`,
            grantType: 'authorization_code',
            scope: ['openid', 'fhirUser'],
            tabTitle: 'fhir.hl7.org.au/aucore',
            message: 'Please contact Heath Frankel for credentials',
        },
        signIn: { type: 'oauth' },
        userInit: { type: 'smile' },
    },
    [AuthProvider.BP]: {
        baseUrl:
            'https://bps-interop-practicegateway-connectathon-fhir-api.deva.svc.bpcloud.dev/api/interop/r4/fhir/',
        fhirBaseUrl:
            'https://bps-interop-practicegateway-connectathon-fhir-api.deva.svc.bpcloud.dev/api/interop/r4/fhir/',
        client: smartOAuthClientConfig('Best practice facade', {
            clientId: 'bp',
            redirectURL: `${window.location.origin}/bp-auth`,
        }),
        signIn: { type: 'mock-token', token: 'september_connectathon_2025' },
        userInit: { type: 'mock', practitionerId: '15000000-0020-0000-0000-98a3489d6ffc' },
    },
    [AuthProvider.IRIS]: {
        baseUrl: 'https://fhirserver.intersystems.com.au/csp/fhir/r4',
        fhirBaseUrl: 'https://fhirserver.intersystems.com.au/csp/fhir/r4',
        client: smartOAuthClientConfig('Intersystems', {
            clientId: 'iris',
            redirectURL: `${window.location.origin}/isir-auth`,
        }),
        signIn: { type: 'mock-token', token: 'september_connectathon_2025' },
        userInit: { type: 'mock', practitionerId: 'cardy-igist' },
    },
    [AuthProvider.MediRecords]: {
        baseUrl: 'https://api-v1.test.medirecords.com/fhir/v1',
        fhirBaseUrl: 'https://api-v1.test.medirecords.com/fhir/v1',
        client: smartOAuthClientConfig('Medirecords', {
            clientId: 'mr',
            redirectURL: `${window.location.origin}/auth`,
        }),
        signIn: { type: 'mock-token', token: 'JOsWSrXQauWP6rC7dnexWfNtGH0' },
        userInit: { type: 'mock', practitionerId: 'b82b3842-ba16-4b01-8c24-7b0deee9b660' },
    },
    [AuthProvider.HaloConnect]: {
        baseUrl: 'https://api.stage.haloconnect.io/integrator/sites/63255e8a-d04a-42a6-8c75-90aa880ad94e/fhir/R4/',
        fhirBaseUrl:
            'https://api.stage.haloconnect.io/integrator/sites/63255e8a-d04a-42a6-8c75-90aa880ad94e/fhir/R4/',
        client: smartOAuthClientConfig('Halo Connect', {
            clientId: 'halo-connect',
            redirectURL: `${window.location.origin}`,
            headers: {
                'Ocp-Apim-Subscription-Key': '923b7ac4add44b02be0e93d3303e55e1',
            },
        }),
        signIn: { type: 'mock-token', token: 'token' },
        userInit: { type: 'mock', practitionerId: 'pr-1' },
    },
    [AuthProvider.MedtechGlobal]: {
        baseUrl: 'https://alexapiuat.medtechglobal.com/FHIR',
        fhirBaseUrl: 'https://alexapiuat.medtechglobal.com/FHIR',
        client: smartOAuthClientConfig('Medtech Global', {
            clientId: 'meditech-global',
            redirectURL: `${window.location.origin}/auth`,
            tokenPath: 'https://login.microsoftonline.com/8a024e99-aba3-4b25-b875-28b0c0ca6096/oauth2/v2.0/token',
        }),
        signIn: { type: 'mock-token', token: MEDTECH_GLOBAL_MOCK_TOKEN },
        userInit: { type: 'mock', practitionerId: 'pr-1' },
    },
    [AuthProvider.Sparked]: {
        baseUrl: 'https://smile.sparked-fhir.com/aucore/fhir/DEFAULT/',
        fhirBaseUrl: 'https://smile.sparked-fhir.com/aucore/fhir/DEFAULT/',
        client: smartOAuthClientConfig('Sparked', {
            clientId: 'sparked',
            redirectURL: `${window.location.origin}/auth`,
        }),
        signIn: { type: 'mock-token', token: 'token' },
        userInit: { type: 'mock', practitionerId: 'leishman-leesa' },
    },
    [AuthProvider.DigitalHealth]: {
        baseUrl: 'https://fhir-xrp.digitalhealth.gov.au/fhir/',
        fhirBaseUrl: 'https://fhir-xrp.digitalhealth.gov.au/fhir/',
        client: smartOAuthClientConfig('Digital Health', {
            clientId: 'digital-health',
            redirectURL: `${window.location.origin}/auth`,
        }),
        signIn: { type: 'mock-token', token: 'token', redirectPath: '/practitioners' },
        userInit: { type: 'mock', practitionerId: 'example-healthconnect-practitioner-1' },
    },
    [AuthProvider.Epic]: {
        baseUrl: 'https://connectathon-au.epic.com/Interconnect-connectathon-au/api/FHIR/R4/',
        fhirBaseUrl: 'https://connectathon-au.epic.com/Interconnect-connectathon-au/api/FHIR/R4/',
        client: smartOAuthClientConfig('Epic', {
            clientId: 'epic',
            redirectURL: `${window.location.origin}/auth`,
        }),
        signIn: { type: 'mock-token', token: EPIC_MOCK_TOKEN },
        userInit: { type: 'mock', practitionerId: 'e-.Lo31-.yLLfMmz0ylcV7A3' },
    },
    [AuthProvider.OrionHealth]: {
        baseUrl: 'https://interop-gateway.odl.io/fhir/4.0/',
        fhirBaseUrl: 'https://interop-gateway.odl.io/fhir/4.0/',
        client: smartOAuthClientConfig('Orion Health', {
            clientId: 'orion-health',
            redirectURL: `${window.location.origin}/auth`,
        }),
        signIn: { type: 'mock-token', token: 'token' },
        userInit: { type: 'mock', practitionerId: 'orion-health' },
    },
    [AuthProvider.EpicEU]: {
        baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
        fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
        client: {
            clientId: 'EPIC-EU',
            authPath: '',
            tokenPath: '',
            responseType: 'code',
            redirectURL: '',
            grantType: 'authorization_code',
            message: 'Provide your token here',
            tabTitle: 'EPIC EU',
        },
        signIn: { type: 'presaved-token' },
        userInit: { type: 'mock', practitionerId: 'epic-eu' },
    },
    [AuthProvider.MeditechEU]: {
        baseUrl: 'https://dev-mtx-interop.meditech.com/',
        fhirBaseUrl: 'https://dev-mtx-interop.meditech.com/v2/uscore/STU6',
        client: {
            clientId: 'ips-testing@d390d8d8fcea406798ca241c6ffaf79e',
            authPath: '',
            tokenPath: '/oauth/token',
            responseType: 'code',
            redirectURL: '',
            grantType: 'client_credentials',
            message: 'Provide your token here',
            tabTitle: 'Meditech EU',
        },
        signIn: { type: 'presaved-token' },
        userInit: { type: 'mock', practitionerId: 'meditech-eu' },
    },
    [AuthProvider.Nuvyta]: {
        baseUrl: 'https://identity.global.nuvyta.cloud/',
        fhirBaseUrl: 'https://test.demo.global.nuvyta.cloud/fhir/fhir',
        client: {
            clientId: 'fhir-api.client',
            authPath: '',
            tokenPath: '/realms/demo/protocol/openid-connect/token',
            responseType: 'code',
            redirectURL: '',
            grantType: 'authorization_code',
            message: 'Provide your token here',
            tabTitle: 'Nuvyta',
        },
        signIn: { type: 'presaved-token' },
        userInit: { type: 'mock', practitionerId: 'nuvyta' },
    },
    [AuthProvider.fhirworks]: {
        baseUrl: 'https://api.fhirworks.com.au/',
        fhirBaseUrl: 'https://api.fhirworks.com.au/fhir',
        client: smartOAuthClientConfig('Fhir works', {
            clientId: 'fhirworks',
            redirectURL: `${window.location.origin}/auth`,
        }),
        signIn: { type: 'mock-token', token: 'token', redirectPath: '/patients' },
        userInit: { type: 'mock', practitionerId: '1465' },

    },
    [AuthProvider.elitemx]: {
        baseUrl: 'https://happy-holmes-senior-intent.trycloudflare.com',
        fhirBaseUrl: 'https://happy-holmes-senior-intent.trycloudflare.com/fhir/R4',
        client: smartOAuthClientConfig('Elite Mx', {
            clientId: 'fhirworks',
            redirectURL: `${window.location.origin}/auth`,
        }),
        signIn: { type: 'mock-token', token: 'token', redirectPath: '/patients' },
        userInit: { type: 'mock', practitionerId: 'f398d65d-2123-4485-b88f-1219eab596a4' },
    },
};
