export type EnglishLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper' | 'advanced';
export type Interest = 'yoga' | 'salsa' | 'karaoke' | 'cafe' | 'parque' | 'ingles';

export interface UserProfile {
  userId: number;
  phone: string | null;
  neighborhood: string | null;
  englishLevel: EnglishLevel | null;
  interests: Interest[];
  avatarUrl: string | null;
  onboardingCompleted: boolean;
}

export interface OnboardingPayload {
  phone: string;
  neighborhood: string;
  englishLevel: EnglishLevel;
  interests: Interest[];
  avatar?: File;
}

export const ENGLISH_LEVEL_LABELS: Record<EnglishLevel, string> = {
  beginner: '🌱 Principiante',
  elementary: '📖 Básico',
  intermediate: '💬 Intermedio',
  upper: '🚀 Intermedio alto',
  advanced: '⭐ Avanzado',
};

export const INTEREST_LABELS: Record<Interest, string> = {
  yoga: '🧘 Yoga',
  salsa: '💃 Salsa',
  karaoke: '🎤 Karaoke',
  cafe: '☕ Cafetería',
  parque: '🌿 Parque',
  ingles: '🗣️ Inglés',
};

export const BOGOTA_NEIGHBORHOODS = [
  'Usaquén', 'Chapinero', 'Santa Fe', 'San Cristóbal', 'Usme',
  'Tunjuelito', 'Bosa', 'Kennedy', 'Fontibón', 'Engativá',
  'Suba', 'Barrios Unidos', 'Teusaquillo', 'Los Mártires',
  'Antonio Nariño', 'Puente Aranda', 'La Candelaria',
  'Rafael Uribe Uribe', 'Ciudad Bolívar',
] as const;
