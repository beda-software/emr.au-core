import { t, Trans } from '@lingui/macro';
import { Bundle, MedicationDispense, MedicationRequest, Patient } from 'fhir/r4b';

import { ResourceListPageContent } from '@beda.software/emr/dist/uberComponents/ResourceListPageContent/index';
import { formatHumanDate } from '@beda.software/emr/dist/utils/index';
import { matchCurrentUserRole, Role } from '@beda.software/emr/dist/utils/role';
import { compileAsArray } from '@beda.software/emr/dist/utils/index';
import { questionnaireAction } from '@beda.software/emr/uberComponents';

import { getMedicationDisplay, getRequesterDisplay } from './medicationRequests';

const pendingMedicationRequests = compileAsArray<Bundle, MedicationRequest>(`
%Bundle.entry.resource.where(
resourceType='MedicationRequest'
and
(%Bundle.entry.resource
        .where(resourceType='MedicationDispense')
        .authorizingPrescription.reference.select(split('/')[1])
contains id).not()
)`)

function extractUndispensedMedicationRequests(bundle: Bundle): MedicationRequest[] {
    return pendingMedicationRequests(bundle, {Bundle: bundle});
}

export function PatientMedicationDispense({ patient }: { patient: Patient }) {
    const canManage = matchCurrentUserRole({
        [Role.Admin]: () => true,
        [Role.Patient]: () => false,
        [Role.Practitioner]: () => true,
        [Role.Receptionist]: () => true,
    });

    return (
        <ResourceListPageContent<MedicationRequest>
            resourceType="MedicationRequest"
            searchParams={{
                patient: patient.id!,
                _revinclude: 'MedicationDispense:prescription',
                _include: 'MedicationRequest:requester',
                _sort: '-authoredon',
            }}
            extractPrimaryResources={extractUndispensedMedicationRequests}
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
                    title: t`Dosage instruction`,
                    key: 'dosageInstruction',
                    render: (_text: any, { resource }) => resource.dosageInstruction?.[0]?.text ?? 'N/A',
                },
            ]}
            getRecordActions={
                canManage ? () => [questionnaireAction(<Trans>Dispense</Trans>, 'medication-dispense-create')] : undefined
            }
            defaultLaunchContext={[{ name: 'Patient', resource: patient }]}
        />
    );
}
