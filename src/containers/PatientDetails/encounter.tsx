import { Bundle, Encounter, Patient } from 'fhir/r4b';

import { PatientApps } from '@beda.software/emr/dist/containers/PatientDetails/PatientApps/index';
import { ResourceDetailPage, Tab } from '@beda.software/emr/dist/uberComponents/ResourceDetailPage/index';
import { compileAsFirst, formatPeriodDateTime } from '@beda.software/emr/dist/utils/index';
import config from '@beda.software/emr-config';
import { WithId } from '@beda.software/fhir-react';

import { AuthProvider, tierConfigMap } from 'src/services/auth.ts';

import { EncounterOverview } from './EncounterOverview';
import { Documents } from '.'

const getPatientName = compileAsFirst<Patient | undefined, string>(
    "Patient.name.given.first() + ' ' + Patient.name.family",
);
const getPatient = compileAsFirst<Bundle, WithId<Patient>>("Bundle.entry.resource.where(resourceType='Patient')");

const tabs: Array<Tab<Encounter|Patient>> = [
    {
        path: '',
        label: 'Overview',
        component: ({ resource }) => <EncounterOverview encounter={resource as Encounter} />,
    },
    {
        path: 'documents',
        label: 'Documents',
        component: ({ resource, bundle }) => <Documents patient={getPatient(bundle)!} encounter={resource as Encounter}/>,
    },


];

if (config.baseURL === tierConfigMap[AuthProvider.SmartOnFhirAidbox].develop.baseUrl) {
    tabs.push({
        path: 'smart',
        label: 'Smart Apps',
        component: ({ resource, bundle }) => <PatientApps patient={getPatient(bundle)!} encounter={resource} />,
    });
}

function getName(resource: Encounter, bundle: Bundle) {
    const patient = getPatient(bundle);
    const patientName = getPatientName(patient) ?? 'Unknown';

    const period = formatPeriodDateTime(resource.period);
    return `${patientName} - ${period}`;
}

export function EncounterPage() {
    return (
        <ResourceDetailPage<Encounter>
            resourceType="Encounter"
            getSearchParams={({ encounter, id }) => ({
                _id: encounter,
                patient: id,
                _include: ['Encounter:patient', 'Encounter:practitioner'],
            })}
            getTitle={({ resource, bundle }) => getName(resource, bundle) ?? 'N/A'}
            tabs={tabs}
        />
    );
}
