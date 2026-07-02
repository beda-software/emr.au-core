import { t } from '@lingui/macro';

import { MenuLayoutValue } from '@beda.software/emr/dist/components/BaseLayout/Sidebar/SidebarTop/context';
import { OrganizationsIcon, PatientsIcon, PractitionersIcon, ServicesIcon } from '@beda.software/emr/icons';
import { matchCurrentUserRole, Role } from '@beda.software/emr/utils';
import config from '@beda.software/emr-config';

import { AuthProvider, authProvidersConfig } from 'src/services/auth.ts';

const EPIC_PATIENT_ID = 'e0lof40pd7mW6R7f0v.4POw3';
const ORION_HEALTH_PATIENT_ID = 'GE3DQMRZHE4UAU2ZKNPUC';

const digitalHealthMenuItems = [
    { label: t`Services`, path: '/healthcare-services', icon: <ServicesIcon /> },
    { label: t`Practitioners`, path: '/practitioners', icon: <PractitionersIcon /> },
    { label: t`Organizations`, path: '/organizations', icon: <OrganizationsIcon /> },
    { label: t`Locations`, path: '/locations', icon: <OrganizationsIcon /> },
];

function getPatientsPath() {
    if (config.baseURL === authProvidersConfig[AuthProvider.Epic].baseUrl) {
        return `/patients/${EPIC_PATIENT_ID}`;
    }

    if (config.baseURL === authProvidersConfig[AuthProvider.OrionHealth].baseUrl) {
        return `/patients/${ORION_HEALTH_PATIENT_ID}`;
    }

    return '/patients';
}

function isDigitalHealth() {
    return config.baseURL === authProvidersConfig[AuthProvider.DigitalHealth].baseUrl;
}

export const menuLayout: MenuLayoutValue = () => {
    if (isDigitalHealth()) {
        return matchCurrentUserRole({
            [Role.Admin]: () => digitalHealthMenuItems,
            [Role.Practitioner]: () => digitalHealthMenuItems,
            [Role.Patient]: () => [],
            [Role.Receptionist]: () => [],
        });
    }

    const patientsPath = getPatientsPath();

    return matchCurrentUserRole({
        [Role.Admin]: () => [{ label: t`Patients`, path: patientsPath, icon: <PatientsIcon /> }],
        [Role.Practitioner]: () => [{ label: t`Patients`, path: patientsPath, icon: <PatientsIcon /> }],
        [Role.Patient]: (patient) => [{ label: 'Me', path: `/patients/${patient.id}`, icon: <PatientsIcon /> }],
        [Role.Receptionist]: () => [],
    });
};
