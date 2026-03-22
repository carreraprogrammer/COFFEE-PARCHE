export type EventType = 'cafe' | 'karaoke' | 'yoga' | 'salsa' | 'park' | 'other';
export type EventStatus = 'draft' | 'published' | 'full' | 'cancelled' | 'completed';

export interface CoffeeEvent {
  id: string;
  title: string;
  description: string | null;
  eventType: EventType;
  status: EventStatus;
  partnerId: string | null;
  partnerName: string | null;
  address: string;
  neighborhood: string;
  startsAt: string;
  endsAt: string | null;
  capacity: number;
  confirmedCount: number;
  waitlistCount: number;
  availableSlots: number;
  isFull: boolean;
  tipMin: number | null;
  tipMax: number | null;
  whatsappInviteLink: string | null;
  coverImageUrl: string | null;
  galleryUrls: string[];
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  event_type: EventType;
  partner_id?: string;
  address: string;
  neighborhood: string;
  starts_at: string;
  ends_at?: string;
  capacity: number;
  tip_min?: number;
  tip_max?: number;
  whatsapp_invite_link?: string;
  cover_image?: File;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  cafe: '☕ Cafetería',
  karaoke: '🎤 Karaoke',
  yoga: '🧘 Yoga',
  salsa: '💃 Salsa',
  park: '🌿 Parque',
  other: '✨ Otro',
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  cafe: 'var(--event-type-cafe)',
  karaoke: 'var(--event-type-karaoke)',
  yoga: 'var(--event-type-yoga)',
  salsa: 'var(--event-type-salsa)',
  park: 'var(--event-type-park)',
  other: 'var(--event-type-other)',
};
