import { PlusOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import type { ColumnsType } from 'antd/es/table';
import { MedicationRequest, Patient } from 'fhir/r4b';

import { SearchBarColumnType } from '@beda.software/emr/dist/components/SearchBar/types';
import { ResourceListPageContent } from '@beda.software/emr/dist/uberComponents/ResourceListPageContent/index';
import type { RecordType } from '@beda.software/emr/dist/uberComponents/ResourceListPage/types';
import { matchCurrentUserRole, Role } from '@beda.software/emr/utils';
import { questionnaireAction } from '@beda.software/emr/uberComponents';

import { getResourceConfigData } from './utils';

const canManageMedicationRequests = () =>
    matchCurrentUserRole({
        [Role.Admin]: () => true,
        [Role.Practitioner]: () => true,
        [Role.Receptionist]: () => true,
        [Role.Patient]: () => false,
    });

export function PatientMedicationRequest({ patient }: { patient: Patient }) {
    const { columns } = getResourceConfigData('MedicationRequest', 'uberList');
    const canManage = canManageMedicationRequests();

    return (
        <ResourceListPageContent<MedicationRequest>
            resourceType="MedicationRequest"
            searchParams={{
                patient: patient.id!,
                _include: ['MedicationRequest:medication:Medication'],
            }}
            getTableColumns={() => columns as ColumnsType<RecordType<MedicationRequest>>}
            getFilters={() => [
                {
                    id: 'status',
                    searchParam: 'status',
                    type: SearchBarColumnType.CHOICE,
                    placeholder: t`Choose status`,
                    options: [
                        { value: { Coding: { code: 'active', display: 'Active' } } },
                        { value: { Coding: { code: 'completed', display: 'Completed' } } },
                        { value: { Coding: { code: 'cancelled', display: 'Cancelled' } } },
                        { value: { Coding: { code: 'on-hold', display: 'On hold' } } },
                        { value: { Coding: { code: 'stopped', display: 'Stopped' } } },
                        { value: { Coding: { code: 'draft', display: 'Draft' } } },
                    ],
                    placement: ['table', 'search-bar'],
                },
            ]}
            getRecordActions={
                canManage
                    ? () => [questionnaireAction(<Trans>Edit</Trans>, 'medication-request-edit')]
                    : undefined
            }
            getHeaderActions={
                canManage
                    ? () => [
                          questionnaireAction(<Trans>Create medication request</Trans>, 'medication-request-create', {
                              icon: <PlusOutlined />,
                          }),
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
