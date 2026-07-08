import { PlusOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Bundle, HumanName, MedicationRequest, Patient } from 'fhir/r4b';

import { SearchBarColumnType } from '@beda.software/emr/dist/components/SearchBar/types';
import { ResourceListPageContent } from '@beda.software/emr/dist/uberComponents/ResourceListPageContent/index';
import { compileAsFirst, formatHumanDate, renderHumanName } from '@beda.software/emr/dist/utils/index';
import { matchCurrentUserRole, Role } from '@beda.software/emr/dist/utils/role';
import { questionnaireAction } from '@beda.software/emr/uberComponents';

import { AuthProvider, authProvidersConfig } from 'src/services/auth.ts';
import config from '@beda.software/emr-config';

const MEDICATIONREQUEST_STATUS_SYSTEM = 'http://hl7.org/fhir/CodeSystem/medicationrequest-status';

const getRequesterId = compileAsFirst<MedicationRequest, string>(
    "MedicationRequest.requester.reference.split('/').last()",
);
const getRequesterType = compileAsFirst<MedicationRequest, string>(
    "MedicationRequest.requester.reference.split('/').first()",
);
const findPractitionerNameById = compileAsFirst<Bundle, HumanName>(
    "Bundle.entry.resource.where(resourceType='Practitioner' and id=%id).first().name.first()",
);
const findOrganizationNameById = compileAsFirst<Bundle, string>(
    "Bundle.entry.resource.where(resourceType='Organization' and id=%id).first().name",
);

export function getRequesterDisplay(resource: MedicationRequest, bundle: Bundle): string {
    if (resource.requester?.display) {
        return resource.requester.display;
    }

    const id = getRequesterId(resource);
    const type = getRequesterType(resource);
    if (!id || !type) {
        return 'N/A';
    }

    if (type === 'Organization') {
        return findOrganizationNameById(bundle, { id }) ?? 'N/A';
    }
    if (type === 'Practitioner') {
        const name = findPractitionerNameById(bundle, { id });
        return name ? renderHumanName(name) : 'N/A';
    }
    return 'N/A';
}

export function getMedicationDisplay(resource: MedicationRequest): string {
    if (resource.medicationCodeableConcept) {
        return resource.medicationCodeableConcept.coding?.[0]?.display ?? resource.medicationCodeableConcept.text ?? 'N/A';
    }
    if (resource.medicationReference) {
        return resource.medicationReference.display ?? 'N/A';
    }
    return 'N/A';
}

function getReasonDisplay(resource: MedicationRequest): string {
    const reason = resource.reasonCode?.[0];
    return reason?.coding?.[0]?.display ?? reason?.text ?? 'N/A';
}

const isFhirWorks = authProvidersConfig[AuthProvider.fhirworks].baseUrl == config.baseURL;

export function PatientMedicationRequest({ patient }: { patient: Patient }) {
    const canManage = matchCurrentUserRole({
        [Role.Admin]: () => true,
        [Role.Patient]: () => false,
        [Role.Practitioner]: () => !isFhirWorks,
        [Role.Receptionist]: () => true,
    });

    return (
        <ResourceListPageContent<MedicationRequest>
            resourceType="MedicationRequest"
            searchParams={{
                patient: patient.id!,
                _include: 'MedicationRequest:requester',
                _sort: '-authoredon',
            }}
            getTableColumns={() => [
                {
                    title: t`Medication`,
                    key: 'medication',
                    render: (_text: any, { resource }) => getMedicationDisplay(resource),
                },
                {
                    title: t`Status`,
                    key: 'status',
                    render: (_text: any, { resource }) => resource.status,
                },
                {
                    title: t`Intent`,
                    key: 'intent',
                    render: (_text: any, { resource }) => resource.intent,
                },
                {
                    title: t`Authored on`,
                    key: 'authoredOn',
                    render: (_text: any, { resource }) =>
                        resource.authoredOn ? formatHumanDate(resource.authoredOn) : 'N/A',
                },
                {
                    title: t`Requester`,
                    key: 'requester',
                    render: (_text: any, { resource, bundle }) => getRequesterDisplay(resource, bundle),
                },
                {
                    title: t`Reason`,
                    key: 'reason',
                    render: (_text: any, { resource }) => getReasonDisplay(resource),
                },
                {
                    title: t`Dosage instruction`,
                    key: 'dosageInstruction',
                    render: (_text: any, { resource }) => resource.dosageInstruction?.[0]?.text ?? 'N/A',
                },
            ]}
            getFilters={() => [
                {
                    id: 'status',
                    searchParam: 'status',
                    type: SearchBarColumnType.CHOICE,
                    placeholder: t`Choose status`,
                    options: (
                        [
                            ['active', t`Active`],
                            ['on-hold', t`On hold`],
                            ['cancelled', t`Cancelled`],
                            ['completed', t`Completed`],
                            ['entered-in-error', t`Entered in error`],
                            ['stopped', t`Stopped`],
                            ['draft', t`Draft`],
                            ['unknown', t`Unknown`],
                        ] as Array<[MedicationRequest['status'], string]>
                    ).map(([code, display]) => ({
                        value: { Coding: { system: MEDICATIONREQUEST_STATUS_SYSTEM, code, display } },
                    })),
                    placement: ['table', 'search-bar'],
                },
            ]}
            getRecordActions={
                canManage ? () => [questionnaireAction(<Trans>Edit</Trans>, 'medication-request-edit')] : undefined
            }
            getHeaderActions={
                canManage
                    ? () => [
                          questionnaireAction(
                              <Trans>Create medication request</Trans>,
                              'medication-request-create',
                              { icon: <PlusOutlined /> },
                          ),
                      ]
                    : undefined
            }
            getReportColumns={(bundle) => [
                {
                    title: t`Number of Medication Requests`,
                    value: bundle.total,
                },
            ]}
            defaultLaunchContext={[{ name: 'Patient', resource: patient }]}
        />
    );
}
