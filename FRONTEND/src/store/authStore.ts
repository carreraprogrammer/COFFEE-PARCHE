import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import type { AuthUser, PermissionSlug } from '../types/authorization.types';
import type { AuthResponse, JwtPayload, LoginCredentials, RegisterPayload } from '../types/auth.types';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { useProfileStore } from './profileStore';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  hydrateAuth: (response: AuthResponse | RawAuthEnvelope) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  hasPermission: (slug: PermissionSlug) => boolean;
  isSuperAdmin: () => boolean;
}

type RawAuthEnvelope = {
  data?: {
    id?: number | string;
    attributes?: {
      name?: string;
      email?: string;
      avatar_url?: string | null;
      auth_provider?: string | null;
      permissions?: string[];
      super_admin?: boolean;
    };
  };
  meta?: {
    access_token?: string;
    refresh_token?: string;
  };
};

const RFT_KEY = 'rft';
const AT_KEY = 'at';
const USER_KEY = 'auth_user';

const getStoredAccessToken = (): string | null => localStorage.getItem(AT_KEY);
const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

const normalizeAuthResponse = (response: AuthResponse | RawAuthEnvelope): AuthResponse => (
  'tokens' in response
    ? response
    : {
        data: {
          id: response.data?.id,
          attributes: {
            name: response.data?.attributes?.name ?? '',
            email: response.data?.attributes?.email,
            avatar_url: response.data?.attributes?.avatar_url ?? null,
            auth_provider: response.data?.attributes?.auth_provider ?? null,
            permissions: response.data?.attributes?.permissions ?? [],
            super_admin: response.data?.attributes?.super_admin ?? false,
          },
        },
        meta: response.meta,
        tokens: {
          accessToken: response.meta?.access_token ?? '',
          refreshToken: response.meta?.refresh_token ?? '',
        },
      }
);

const mapUser = (response: AuthResponse, currentUser: AuthUser | null): AuthUser => {
  const payload = jwtDecode<JwtPayload>(response.tokens.accessToken);
  return {
    id: payload.user_id,
    email: response.data.attributes.email ?? currentUser?.email ?? payload.email,
    name: response.data.attributes.name || currentUser?.name || payload.email,
    avatarUrl: response.data.attributes.avatar_url ?? currentUser?.avatarUrl ?? null,
    authProvider: response.data.attributes.auth_provider ?? currentUser?.authProvider ?? null,
    superAdmin: payload.super_admin,
    permissions: payload.permissions,
  };
};

const persistAuth = (response: AuthResponse, user: AuthUser, set: (partial: Partial<AuthState>) => void): void => {
  localStorage.setItem(RFT_KEY, response.tokens.refreshToken);
  localStorage.setItem(AT_KEY, response.tokens.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  set({ accessToken: response.tokens.accessToken, isAuthenticated: true, user, isLoading: false });
};

const redirectAfterProfile = async (): Promise<void> => {
  try {
    const profile = await profileService.getMyProfile();
    useProfileStore.getState().setProfile(profile);
    window.history.replaceState({}, '', profile.onboardingCompleted ? '/events' : '/onboarding');
    window.dispatchEvent(new PopStateEvent('popstate'));
  } catch {
    window.history.replaceState({}, '', '/onboarding');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
};

const initialAccessToken = getStoredAccessToken();
const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  accessToken: initialAccessToken,
  isAuthenticated: Boolean(initialAccessToken && initialUser),
  isLoading: false,
  async login(credentials) {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      const user = mapUser(response, get().user);
      persistAuth(response, user, set);
      await redirectAfterProfile();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  async register(payload) {
    set({ isLoading: true });
    try {
      const response = await authService.register(payload);
      const user = mapUser(response, get().user);
      persistAuth(response, user, set);
      await redirectAfterProfile();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  hydrateAuth(response) {
    const normalized = normalizeAuthResponse(response);
    persistAuth(normalized, mapUser(normalized, get().user), set);
  },
  async logout() {
    localStorage.removeItem(RFT_KEY);
    localStorage.removeItem(AT_KEY);
    localStorage.removeItem(USER_KEY);
    useProfileStore.getState().setProfile(null as never);
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
  async refreshToken() {
    const refreshToken = localStorage.getItem(RFT_KEY);
    const userId = get().user?.id;
    if (!refreshToken || !userId) return;
    const response = await authService.refresh(refreshToken, userId);
    const user = mapUser(response, get().user);
    persistAuth(response, user, set);
    try {
      useProfileStore.getState().setProfile(await profileService.getMyProfile());
    } catch {
      // Ignore bootstrap profile failures during token refresh.
    }
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },
  hasPermission(slug) {
    const { user } = get();
    if (!user) return false;
    if (user.superAdmin) return true;
    return user.permissions.includes(slug);
  },
  isSuperAdmin() {
    return get().user?.superAdmin ?? false;
  },
}));
