import { Patient } from 'fhir/r4b';
import { DetailPage, Tab } from '@beda.software/emr/dist/uberComponents/DetailPage/index';
import { compileAsFirst } from '@beda.software/emr/dist/utils/index';
import { PatientOverview } from '@beda.software/emr/dist/containers/PatientDetails/PatientOverviewDynamic/index';
import { PatientDashboardProvider } from '@beda.software/emr/dist/components/Dashboard/contexts';
import { dashboard } from './dashboard';
import { PatientApps } from '@beda.software/emr/dist/containers/PatientDetails/PatientApps/index';
import { PatientEncounter } from './encounters';
import { PatientServiceRequest } from './requests';


const getName = compileAsFirst<Patient, string>("Patient.name.given.first() + ' ' + Patient.name.family");

const tabs: Array<Tab<Patient>> = [
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
        path: 'service',
        label: 'Service requests',
        component: ({ resource }) => <PatientServiceRequest patient={resource} />,
    },
    {
        path: 'smart',
        label: 'Smart Apps',
        component: ({ resource }) => <PatientApps patient={resource} />,
    }
];

export function PatientDetails() {
    return (
        <PatientDashboardProvider dashboard={dashboard}>
            <DetailPage<Patient>
                resourceType="Patient"
                getSearchParams={({ id }) => ({ _id: id })}
                getTitle={({ resource, bundle }) => getName(resource, { bundle })!}
                tabs={tabs}
            />
        </PatientDashboardProvider>
    );
}
