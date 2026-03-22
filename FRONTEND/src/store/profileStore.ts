import { create } from 'zustand';
import { profileService } from '../services/profileService';
import type { EnglishLevel, Interest, UserProfile } from '../types/profile.types';

interface OnboardingPayload {
  phone: string;
  neighborhood: string;
  englishLevel: EnglishLevel;
  interests: Interest[];
  avatar?: File;
}

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: (data: OnboardingPayload) => Promise<void>;
  updateProfile: (data: Partial<OnboardingPayload>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  async fetchProfile() {
    set({ isLoading: true });
    try {
      const profile = await profileService.getMyProfile();
      set({ profile });
    } finally {
      set({ isLoading: false });
    }
  },
  setProfile(profile) {
    set({ profile });
  },
  async completeOnboarding(data) {
    const profile = await profileService.completeOnboarding(data);
    set({ profile });
  },
  async updateProfile(data) {
    const profile = await profileService.update(data);
    set({ profile });
  },
}));
