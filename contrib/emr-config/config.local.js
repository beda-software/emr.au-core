
const config = {
    clientId: window.localStorage.getItem('ClientId') || 'web',
    authTokenPath: window.localStorage.getItem('auth_token_path') || 'auth/token',
    authClientRedirectURL: window.localStorage.getItem('auth_client_redirect_url') || 'http://localhost:8080/auth-aidbox',

    wearablesAccessConsentCodingSystem: 'https://fhir.emr.beda.software/CodeSystem/consent-subject',

    tier: 'develop',
    baseURL: window.localStorage.getItem('baseURL') || 'http://localhost:8080',
    fhirBaseURL: window.localStorage.getItem('fhirBaseURL') || 'http://localhost:8080/fhir',
    sdcIdeUrl: 'http://localhost:3001',
    aiQuestionnaireBuilderUrl: 'http://localhost:3002',
    sdcBackendUrl: null,

    webSentryDSN: null,
    mobileSentryDSN: null,

    jitsiMeetServer: null,

    wearablesDataStreamService: null,

    metriportIdentifierSystem: null,
    aiAssistantServiceUrl: null,
};

export { config as default };