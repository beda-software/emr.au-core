import { Patient } from 'fhir/r4b';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { PageContainer } from '@beda.software/emr/dist/components/BaseLayout/PageContainer/index';
import { PatientDashboardProvider } from '@beda.software/emr/dist/components/Dashboard/contexts';
import { PatientDocument } from '@beda.software/emr/dist/containers/PatientDetails/PatientDocument/index';
import { PatientDocumentDetails } from '@beda.software/emr/dist/containers/PatientDetails/PatientDocumentDetails/index';
import { PatientDocuments } from '@beda.software/emr/dist/containers/PatientDetails/PatientDocuments/index';
import { PatientOverview } from '@beda.software/emr/dist/containers/PatientDetails/PatientOverviewDynamic/index';
import { PageTabs, ResourceDetailPage, Tab } from '@beda.software/emr/dist/uberComponents/ResourceDetailPage/index';
import { compileAsFirst, renderHumanName } from '@beda.software/emr/dist/utils/index';
import { service } from '@beda.software/emr/services';
import config from '@beda.software/emr-config';
import { RenderRemoteData, useService, WithId } from '@beda.software/fhir-react';

import { AuthProvider, authProvidersConfig } from 'src/services/auth.ts';

import { dashboard } from './dashboard';
import { PatientEncounter } from './encounters';
import { PatientApps } from './PatientApps/index';
import { PatientServiceRequest } from './requests';
import { ResourcesTabRoutes } from './ResourcesTabRoutes';
import { S } from './styles';

const getName = compileAsFirst<Patient, string>("Patient.name.given.first() + ' ' + Patient.name.family");

const tabs: Array<Tab<WithId<Patient>>> = [
    {
        path: '',
        label: 'Overview',
        component: ({ resource }) => <PatientOverview patient={resource} />,
    },
    {
        path: 'encounter',
        label: 'Encounters',
        component: ({ resource }) => <PatientEncounter patient={resource} />,
    },
    {
        path: 'resources',
        label: 'Resources',
        component: () => <ResourcesTabRoutes />,
    },
];

if (config.baseURL === authProvidersConfig[AuthProvider.AuCoreAidbox].baseUrl) {
    tabs.push({
        path: 'documents',
        label: 'Documents',
        component: ({ resource }) => <Documents patient={resource} />,
    });
}

if (
    [
        authProvidersConfig[AuthProvider.ErequestingAidbox].baseUrl,
        authProvidersConfig[AuthProvider.ErequestingSparked].baseUrl,
        authProvidersConfig[AuthProvider.ErequestingCallistemon].baseUrl,
    ].includes(config.baseURL)
) {
    tabs.push({
        path: 'service',
        label: 'Service requests',
        component: ({ resource }) => <PatientServiceRequest patient={resource} />,
    });
}

if (config.baseURL === authProvidersConfig[AuthProvider.SmartOnFhirAidbox].baseUrl) {
    tabs.push({
        path: 'smart',
        label: 'Smart Apps',
        component: ({ resource }) => <PatientApps patient={resource} />,
    });
}

if (config.baseURL === authProvidersConfig[AuthProvider.AuCoreAidbox].baseUrl) {
    tabs.push({
        path: 'smart',
        label: 'Smart Apps',
        component: ({ resource }) => <PatientApps patient={resource} />,
    });
}

export function PatientDetails() {
    const isEpic = config.baseURL === authProvidersConfig[AuthProvider.Epic].baseUrl;
    const isOrionHealth = config.baseURL === authProvidersConfig[AuthProvider.OrionHealth].baseUrl;

    return (
        <PatientDashboardProvider dashboard={dashboard}>
            {isEpic ? (
                <EpicPatientDetails />
            ) : isOrionHealth ? (
                <OrionHealthPatientDetails />
            ) : (
                <ResourceDetailPage<Patient>
                    resourceType="Patient"
                    getSearchParams={({ id }) => ({ _id: id })}
                    getTitle={({ resource, bundle }) => getName(resource, { bundle })!}
                    tabs={tabs}
                    maxWidth="100%"
                />
            )}
        </PatientDashboardProvider>
    );
}

function EpicPatientDetails() {
    const [response] = useService(() =>
        service<Patient>({
            method: 'GET',
            url: `/Patient/e0lof40pd7mW6R7f0v.4POw3`,
        }),
    );

    return (
        <RenderRemoteData remoteData={response}>
            {(patient) => {
                return (
                    <PageContainer
                        title={renderHumanName(patient.name?.[0])}
                        layoutVariant="with-tabs"
                        headerContent={<PageTabs tabs={tabs} />}
                    >
                        <Routes>
                            {tabs.map(({ path, component }) => (
                                <React.Fragment key={path}>
                                    <Route path={'/' + path} element={component({ resource: patient } as any)} />
                                    <Route path={'/' + path + '/*'} element={component({ resource: patient } as any)} />
                                </React.Fragment>
                            ))}
                        </Routes>
                    </PageContainer>
                );
            }}
        </RenderRemoteData>
    );
}

function OrionHealthPatientDetails() {
    const [response] = useService(() => {
        return service<Patient>({
            method: 'GET',
            url: `/Patient/GE3DQMRZHE4UAU2ZKNPUC`,
            ...(config.baseURL === authProvidersConfig[AuthProvider.OrionHealth].baseUrl
                ? { headers: { 'Cache-Control': null } }
                : {}),
        });
    });

    return (
        <RenderRemoteData remoteData={response}>
            {(patient) => {
                return (
                    <PageContainer
                        title={renderHumanName(patient.name?.[0])}
                        layoutVariant="with-tabs"
                        headerContent={<PageTabs tabs={tabs} />}
                    >
                        <Routes>
                            {tabs.map(({ path, component }) => (
                                <React.Fragment key={path}>
                                    <Route path={'/' + path} element={component({ resource: patient } as any)} />
                                    <Route path={'/' + path + '/*'} element={component({ resource: patient } as any)} />
                                </React.Fragment>
                            ))}
                        </Routes>
                    </PageContainer>
                );
            }}
        </RenderRemoteData>
    );
}

export function Documents({ patient }: { patient: WithId<Patient> }) {
    return (
        <Routes>
            <Route path="/" element={<PatientDocuments patient={patient} />} />
            <Route
                path="/new/:questionnaireId"
                element={
                    <S.PatientDocument>
                            <PatientDocument
                                autoSave={true}
                                onSuccess={() => {
                                    window.history.back();
                                }}
                            />
                    </S.PatientDocument>
                }
            />
            <Route path="/:qrId/*" element={<PatientDocumentDetails patient={patient} />} />
        </Routes>
    );
}
