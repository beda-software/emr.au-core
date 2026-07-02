import { Patient } from 'fhir/r4b';

import type { Dashboard, DashboardInstance, WidgetInfo } from '@beda.software/emr/dist/components/Dashboard/types';
import { StandardCardContainerFabric } from '@beda.software/emr/dist/containers/PatientDetails/PatientOverviewDynamic/containers/StandardCardContainerFabric/index';
import config from '@beda.software/emr-config';

import { AuthProvider, authProvidersConfig } from 'src/services/auth.ts';

import { DocRrefContainer } from './containers/DocRefContainer';
import { SummaryContainer } from './containers/SummaryContainer';
import {
    prepareAllergies,
    prepareComposition,
    prepareConditions,
    prepareImmunizations,
    prepareMedicationRequests,
    prepareMedicationStatements,
    prepareObservations,
    prepareProcedures,
    prepareRelatedPersons,
} from '../utils';

const patientDashboardConfig: DashboardInstance = {
    top:
        config.baseURL === authProvidersConfig[AuthProvider.OrionHealth].baseUrl
            ? [
                  {
                      widget: SummaryContainer,
                  },
              ]
            : [
                  ...(config.baseURL === authProvidersConfig[AuthProvider.AuCoreAidbox].baseUrl
                      ? [
                            {
                                widget: DocRrefContainer,
                            },
                        ]
                      : []),
                  ...(config.baseURL === authProvidersConfig[AuthProvider.BP].baseUrl
                      ? [
                            {
                                widget: SummaryContainer,
                            },
                        ]
                      : []),
                  ...(config.baseURL === authProvidersConfig[AuthProvider.HaloConnect].baseUrl
                      ? [
                            {
                                widget: SummaryContainer,
                            },
                        ]
                      : []),
                  ...(config.baseURL === authProvidersConfig[AuthProvider.MedtechGlobal].baseUrl
                      ? [
                            {
                                widget: SummaryContainer,
                            },
                        ]
                      : []),
                  ...(config.baseURL === authProvidersConfig[AuthProvider.MediRecords].baseUrl
                      ? [
                            {
                                widget: SummaryContainer,
                            },
                        ]
                      : []),
                  ...(config.baseURL === authProvidersConfig[AuthProvider.Sparked].baseUrl
                      ? [
                            {
                                widget: SummaryContainer,
                            },
                        ]
                      : []),
                  ...(config.baseURL === authProvidersConfig[AuthProvider.DigitalHealth].baseUrl
                      ? [
                            {
                                widget: SummaryContainer,
                            },
                        ]
                      : []),
                  ...(config.baseURL === authProvidersConfig[AuthProvider.Epic].baseUrl
                      ? [
                            {
                                widget: SummaryContainer,
                            },
                        ]
                      : []),
                  ...(config.baseURL === authProvidersConfig[AuthProvider.AuCoreAidbox].baseUrl
                      ? Array.of<WidgetInfo>({
                            widget: StandardCardContainerFabric(prepareComposition),
                            query: {
                                resourceType: 'Composition',
                                search: (patient: Patient) => ({
                                    subject: patient.id,
                                    _sort: '-date',
                                    _count: 10,
                                    _include: [
                                        'Composition:subject:Patient',
                                        'Composition:entry',
                                        'Composition:author:Practitioner',
                                    ],
                                }),
                            },
                        })
                      : []),
                  {
                      query: {
                          resourceType: 'AllergyIntolerance',
                          search: (patient: Patient) => ({
                              patient: patient.id,
                              _count: 7,
                          }),
                      },
                      widget: StandardCardContainerFabric(prepareAllergies),
                  },
                  {
                      query: {
                          resourceType: 'Condition',
                          search: (patient: Patient) => ({
                              patient: patient.id,
                              _count: 7,
                          }),
                      },
                      widget: StandardCardContainerFabric(prepareConditions),
                  },
                  {
                      query: {
                          resourceType: 'Observation',
                          search: (patient: Patient) => ({
                              subject: patient.id,
                              _count: 7,
                          }),
                      },
                      widget: StandardCardContainerFabric(prepareObservations),
                  },
                  {
                      query: {
                          resourceType: 'Immunization',
                          search: (patient: Patient) => ({
                              patient: patient.id,
                              _count: 7,
                          }),
                      },
                      widget: StandardCardContainerFabric(prepareImmunizations),
                  },
                  {
                      query: {
                          resourceType: 'MedicationStatement',
                          search: (patient: Patient) => ({
                              patient: patient.id,
                              _count: 7,
                          }),
                      },
                      widget: StandardCardContainerFabric(prepareMedicationStatements),
                  },
                  {
                      query: {
                          resourceType: 'MedicationRequest',
                          search: (patient: Patient) => ({
                              patient: patient.id,
                              _count: 7,
                          }),
                      },
                      widget: StandardCardContainerFabric(prepareMedicationRequests),
                  },
                  {
                      query: {
                          resourceType: 'Procedure',
                          search: (patient: Patient) => ({
                              subject: patient.id,
                              _count: 7,
                          }),
                      },
                      widget: StandardCardContainerFabric(prepareProcedures),
                  },
                  {
                      query: {
                          resourceType: 'RelatedPerson',
                          search: (patient: Patient) => ({
                              patient: patient.id,
                              _count: 7,
                          }),
                      },
                      widget: StandardCardContainerFabric(prepareRelatedPersons),
                  },
              ],
    left: [],
    right: [],
    bottom: [],
};

export const dashboard: Dashboard = {
    default: patientDashboardConfig,
};
