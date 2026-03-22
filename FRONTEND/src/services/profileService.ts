import { api } from './api';
import type { OnboardingPayload, UserProfile } from '../types/profile.types';

interface ProfileApiItem {
  id: string;
  type: 'profiles';
  attributes: {
    user_id: number;
    phone: string | null;
    neighborhood: string | null;
    english_level: UserProfile['englishLevel'];
    interests: UserProfile['interests'];
    avatar_url: string | null;
    onboarding_completed: boolean;
  };
}

const mapProfile = (item: ProfileApiItem): UserProfile => ({
  userId: item.attributes.user_id,
  phone: item.attributes.phone,
  neighborhood: item.attributes.neighborhood,
  englishLevel: item.attributes.english_level,
  interests: item.attributes.interests ?? [],
  avatarUrl: item.attributes.avatar_url,
  onboardingCompleted: item.attributes.onboarding_completed,
});

export const profileService = {
  async getMyProfile(): Promise<UserProfile> {
    const response = await api.get<{ data: ProfileApiItem }>('/api/v1/profile');
    return mapProfile(response.data.data);
  },
  async completeOnboarding(data: OnboardingPayload): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('phone', data.phone);
    formData.append('neighborhood', data.neighborhood);
    formData.append('english_level', data.englishLevel);
    data.interests.forEach((interest) => formData.append('interests[]', interest));
    if (data.avatar) formData.append('avatar', data.avatar);
    const response = await api.post<{ data: ProfileApiItem }>('/api/v1/profile/complete_onboarding', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapProfile(response.data.data);
  },
  async update(data: Partial<OnboardingPayload>): Promise<UserProfile> {
    const formData = new FormData();
    if (data.phone) formData.append('phone', data.phone);
    if (data.neighborhood) formData.append('neighborhood', data.neighborhood);
    if (data.englishLevel) formData.append('english_level', data.englishLevel);
    data.interests?.forEach((interest) => formData.append('interests[]', interest));
    if (data.avatar) formData.append('avatar', data.avatar);
    const response = await api.patch<{ data: ProfileApiItem }>('/api/v1/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapProfile(response.data.data);
  },
};
