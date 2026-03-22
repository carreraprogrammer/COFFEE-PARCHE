import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PermissionRoute } from './PermissionRoute';
import { OnboardingGuard } from './OnboardingGuard';
import { LoginPage } from '../components/pages/LoginPage/LoginPage';
import { RegisterPage } from '../components/pages/RegisterPage/RegisterPage';
import { DashboardPage } from '../components/pages/DashboardPage/DashboardPage';
import { ProfilePage } from '../components/pages/ProfilePage/ProfilePage';
import { NotFoundPage } from '../components/pages/NotFoundPage/NotFoundPage';
import { OAuthCallbackPage } from '../components/pages/OAuthCallbackPage';
import { OnboardingPage } from '../components/pages/OnboardingPage';
import { EventsPage } from '../components/pages/EventsPage';
import { EventDetailPage } from '../components/pages/EventDetailPage';
import { MyEventsPage } from '../components/pages/MyEventsPage';
import { AdminEventsPage } from '../components/pages/AdminEventsPage';
import { AdminEventDetailPage } from '../components/pages/AdminEventDetailPage';
import { ParticipantsPage } from '../components/pages/ParticipantsPage';
import { EnrollmentsPage } from '../components/pages/EnrollmentsPage';
import { PartnersPage } from '../components/pages/PartnersPage';

const Protected = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to='/login' replace />;
};

const Guest = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : children;
};

const Onboarded = ({ children }: { children: JSX.Element }) => <Protected>{children}</Protected>;

export const AppRouter = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return (
    <Routes>
      <Route path='/' element={<Navigate to={isAuthenticated ? '/events' : '/login'} replace />} />
      <Route path='/login' element={<Guest><LoginPage /></Guest>} />
      <Route path='/register' element={<Guest><RegisterPage /></Guest>} />
      <Route path='/auth/callback' element={<OAuthCallbackPage />} />
      <Route path='/dashboard' element={<Protected><DashboardPage /></Protected>} />
      <Route path='/profile' element={<Protected><ProfilePage /></Protected>} />
      <Route path='/onboarding' element={<OnboardingGuard><OnboardingPage /></OnboardingGuard>} />
      <Route path='/events' element={<Onboarded><EventsPage /></Onboarded>} />
      <Route path='/events/:id' element={<Onboarded><EventDetailPage /></Onboarded>} />
      <Route path='/my-events' element={<Onboarded><MyEventsPage /></Onboarded>} />
      <Route path='/admin/events' element={<Protected><PermissionRoute permission='events:create'><AdminEventsPage /></PermissionRoute></Protected>} />
      <Route path='/admin/events/:id' element={<Protected><PermissionRoute permission='events:update'><AdminEventDetailPage /></PermissionRoute></Protected>} />
      <Route path='/admin/events/:id/participants' element={<Protected><PermissionRoute permission='events:read'><ParticipantsPage /></PermissionRoute></Protected>} />
      <Route path='/admin/enrollments' element={<Protected><PermissionRoute permission='enrollments:verify'><EnrollmentsPage /></PermissionRoute></Protected>} />
      <Route path='/admin/partners' element={<Protected><PermissionRoute permission='partners:read'><PartnersPage /></PermissionRoute></Protected>} />
      <Route path='/admin/users' element={<Protected><PermissionRoute permission='users:read'><DashboardPage /></PermissionRoute></Protected>} />
      <Route path='/admin/roles' element={<Protected><PermissionRoute permission='roles:read'><DashboardPage /></PermissionRoute></Protected>} />
      <Route path='/admin/forms' element={<Protected><PermissionRoute permission='forms:read'><DashboardPage /></PermissionRoute></Protected>} />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
};
