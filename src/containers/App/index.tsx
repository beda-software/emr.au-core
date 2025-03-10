import { t } from '@lingui/macro';
import queryString from 'query-string';
import { ReactElement, useEffect, useRef } from 'react';
import { Route, BrowserRouter, Routes, Navigate, useLocation } from 'react-router-dom';

import { RenderRemoteData } from 'aidbox-react/lib/components/RenderRemoteData';
import { useService } from 'aidbox-react/lib/hooks/service';
import { success } from 'aidbox-react/lib/libs/remoteData';

import { User } from '@beda.software/aidbox-types';
import { BaseLayout , Spinner } from '@beda.software/emr/components';
import { NotificationPage, PatientResourceListExample, SetPassword  } from '@beda.software/emr/containers';
// import { MenuLayout } from '@beda.software/emr/dist/components/BaseLayout/Sidebar/SidebarTop/context'
import { getToken, parseOAuthState, setToken } from '@beda.software/emr/services';

import { DefaultUserWithNoRoles } from './DefaultUserWithNoRoles';
import { restoreUserSession } from './utils';
import { SignIn } from '../SignIn';

interface AppProps {
    populateUserInfoSharedState?: (user: User) => Promise<void>;
    UserWithNoRolesComponent?: () => ReactElement;
}

export function App(props: AppProps) {
    const { populateUserInfoSharedState, UserWithNoRolesComponent } = props;
    // const menuLayout = useContext(MenuLayout);
    const [userResponse] = useService(async () => {
        const appToken = getToken();
        return appToken ? restoreUserSession(appToken, populateUserInfoSharedState) : success(null);
    });

    const renderRoutes = (user: User | null) => {
        if (user) {
            if ((user.role?.length ?? 0) === 0) {
                const UserWithNoRoles = UserWithNoRolesComponent ?? DefaultUserWithNoRoles;

                return <UserWithNoRoles />;
            }

            // const layout = menuLayout();
            const defaultRoute = '/patients-uber';
            return <AuthenticatedUserApp defaultRoute={defaultRoute} />;
        }

        return <AnonymousUserApp />;
    };

    return (
        <div data-testid="app-container">
            <RenderRemoteData remoteData={userResponse} renderLoading={Spinner}>
                {(user) => <BrowserRouter>{renderRoutes(user)}</BrowserRouter>}
            </RenderRemoteData>
        </div>
    );
}

export function Auth() {
    const location = useLocation();

    useEffect(() => {
        const queryParams = queryString.parse(location.hash);

        if (queryParams.access_token) {
            setToken(queryParams.access_token as string);
            const state = parseOAuthState(queryParams.state as string | undefined);

            window.location.href = state.nextUrl ?? '/';
        }
    }, [location.hash]);

    return null;
}

function AnonymousUserApp({ extra }: { extra?: ReactElement }) {
    const location = useLocation();
    const originPathRef = useRef(location.pathname);

    return (
        <Routes>
            {extra}
            <Route path="/auth" element={<Auth />} />
            <Route path="/signin" element={<SignIn originPathName={originPathRef.current} />} />
            <Route path="/reset-password/:code" element={<SetPassword />} />
            <Route
                path="*"
                element={
                    <>
                        <Navigate to="/signin" replace={true} />
                    </>
                }
            />
            <Route
                path="/thanks"
                element={
                    <NotificationPage
                        title={t`Thank you!`}
                        text={t`Thank you for filling out the questionnaire. Now you can close this page.`}
                    />
                }
            />
        </Routes>
    );
}

interface RouteProps {
    defaultRoute: string;
}

function AuthenticatedUserApp({ defaultRoute }: RouteProps) {
    return (
        <Routes>
            <Route
                path="*"
                element={
                    <BaseLayout>
                        <Routes>
                            <Route path="/patients-uber" element={<PatientResourceListExample />} />
                            <Route path="*" element={<Navigate to={defaultRoute} />} />
                        </Routes>
                    </BaseLayout>
                }
            />
        </Routes>
    );
}
