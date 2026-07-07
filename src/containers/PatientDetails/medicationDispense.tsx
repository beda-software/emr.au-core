import { t, Trans } from '@lingui/macro';
import { Bundle, MedicationDispense, MedicationRequest, Patient } from 'fhir/r4b';

import { ResourceListPageContent } from '@beda.software/emr/dist/uberComponents/ResourceListPageContent/index';
import { formatHumanDate } from '@beda.software/emr/dist/utils/index';
import { matchCurrentUserRole, Role } from '@beda.software/emr/dist/utils/role';
import { questionnaireAction } from '@beda.software/emr/uberComponents';

import {
    getMedicationDisplay,
    getReasonDisplay,
    getRequesterDisplay,
} from './medicationRequests';

function extractUndispensedMedicationRequests(bundle: Bundle): MedicationRequest[] {
    const medicationRequests =
        bundle.entry
            ?.filter((entry) => entry.resource?.resourceType === 'MedicationRequest')
            .map((entry) => entry.resource as MedicationRequest) ?? [];

    const dispensedMedicationRequestIds = new Set(
        bundle.entry
            ?.filter((entry) => entry.resource?.resourceType === 'MedicationDispense')
            .flatMap((entry) => (entry.resource as MedicationDispense).authorizingPrescription ?? [])
            .map((reference) => reference.reference?.split('/').pop())
            .filter((id): id is string => Boolean(id)) ?? [],
    );

    return medicationRequests.filter((resource) => resource.id && !dispensedMedicationRequestIds.has(resource.id));
}

export function PatientMedicationDispense({ patient }: { patient: Patient }) {
    const canDispense = matchCurrentUserRole({
        [Role.Admin]: () => true,
        [Role.Patient]: () => false,
        [Role.Practitioner]: () => true,
        [Role.Receptionist]: () => true,
    });

    return (
        <ResourceListPageContent<MedicationRequest>
            resourceType="MedicationRequest"
            extractPrimaryResources={extractUndispensedMedicationRequests}
            searchParams={{
                patient: patient.id!,
                status: 'active',
                _include: 'MedicationRequest:requester',
                _revinclude: 'MedicationDispense:prescription',
                _sort: '-authoredon',
            }}
            getTableColumns={() => [
                {
                    title: t`Medication`,
                    key: 'medication',
                    render: (_text: unknown, { resource }) => getMedicationDisplay(resource),
                },
                {
                    title: t`Status`,
                    key: 'status',
                    render: (_text: unknown, { resource }) => resource.status,
                },
                {
                    title: t`Intent`,
                    key: 'intent',
                    render: (_text: unknown, { resource }) => resource.intent,
                },
                {
                    title: t`Authored on`,
                    key: 'authoredOn',
                    render: (_text: unknown, { resource }) =>
                        resource.authoredOn ? formatHumanDate(resource.authoredOn) : 'N/A',
                },
                {
                    title: t`Requester`,
                    key: 'requester',
                    render: (_text: unknown, { resource, bundle }) => getRequesterDisplay(resource, bundle),
                },
                {
                    title: t`Reason`,
                    key: 'reason',
                    render: (_text: unknown, { resource }) => getReasonDisplay(resource),
                },
                {
                    title: t`Dosage instruction`,
                    key: 'dosageInstruction',
                    render: (_text: unknown, { resource }) => resource.dosageInstruction?.[0]?.text ?? 'N/A',
                },
            ]}
            getRecordActions={
                canDispense
                    ? () => [questionnaireAction(<Trans>Dispense</Trans>, 'medication-dispense-create')]
                    : undefined
            }
            defaultLaunchContext={[{ name: 'Patient', resource: patient }]}
        />
    );
}
