import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';

export const OnboardingGuard = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const profile = useProfileStore((state) => state.profile);

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (profile?.onboardingCompleted) {
    return <Navigate to='/events' replace />;
  }

  return <>{children}</>;
};
