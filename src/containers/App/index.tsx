import { Route } from 'react-router-dom';

import {
    Auth as ImplicitGrantAuth,
    CodeGrantAuth,
    EMR,
    HealthcareServiceList,
    PractitionerDetails,
    PractitionerList,
} from '@beda.software/emr/containers';

import { useApp } from './hooks';
import { menuLayout } from './layout';
import { LocationResourceList } from '../LocationResourceList';
import { OrganizationResourceList } from '../OrganizationResourceList';
import { PatientDetails } from '../PatientDetails';
import { EncounterPage } from '../PatientDetails/encounter';
import { PatientResourceList } from '../PatientResourceList';
import { SignIn } from '../SignIn';

export function App() {
    const { sharedUserInitService, setAuthProvider } = useApp();

    return (
        <EMR
            authenticatedRoutes={
                <>
                    <Route path="/practitioners" element={<PractitionerList />} />
                    <Route path="/practitioners/:id/*" element={<PractitionerDetails />} />
                    <Route path="/healthcare-services" element={<HealthcareServiceList />} />
                    <Route path="/organizations" element={<OrganizationResourceList />} />
                    <Route path="/locations" element={<LocationResourceList />} />
                    <Route path="/patients" element={<PatientResourceList />} />
                    <Route path="/patients/:id/encounter/:encounter/*" element={<EncounterPage />} />
                    <Route path="/patients/:id/*" element={<PatientDetails />} />
                </>
            }
            anonymousRoutes={
                <>
                    <Route path="/signin" element={<SignIn onSwitchService={setAuthProvider} />} />
                    <Route path="/auth" element={<CodeGrantAuth />} />
                    <Route path="/auth-aidbox" element={<ImplicitGrantAuth />} />
                </>
            }
            populateUserInfoSharedState={sharedUserInitService}
            menuLayout={menuLayout}
        />
    );
}
