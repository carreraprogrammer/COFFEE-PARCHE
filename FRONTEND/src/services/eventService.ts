import { api } from './api';
import type { CoffeeEvent, CreateEventPayload, EventType } from '../types/event.types';
import type { EnrollmentWithUser } from '../types/enrollment.types';

interface EventApiItem {
  id: string;
  type: 'events';
  attributes: {
    title: string;
    description: string | null;
    event_type: CoffeeEvent['eventType'];
    status: CoffeeEvent['status'];
    partner_id: string | null;
    partner_name?: string | null;
    address: string;
    neighborhood: string;
    starts_at: string;
    ends_at: string | null;
    capacity: number;
    confirmed_count: number;
    waitlist_count: number;
    available_slots: number;
    is_full: boolean;
    tip_min: number | null;
    tip_max: number | null;
    whatsapp_invite_link: string | null;
    cover_image_url: string | null;
    gallery_urls: string[];
  };
}

const mapEvent = (item: EventApiItem): CoffeeEvent => ({
  id: item.id,
  title: item.attributes.title,
  description: item.attributes.description,
  eventType: item.attributes.event_type,
  status: item.attributes.status,
  partnerId: item.attributes.partner_id,
  partnerName: item.attributes.partner_name ?? null,
  address: item.attributes.address,
  neighborhood: item.attributes.neighborhood,
  startsAt: item.attributes.starts_at,
  endsAt: item.attributes.ends_at,
  capacity: item.attributes.capacity,
  confirmedCount: item.attributes.confirmed_count,
  waitlistCount: item.attributes.waitlist_count,
  availableSlots: item.attributes.available_slots,
  isFull: item.attributes.is_full,
  tipMin: item.attributes.tip_min,
  tipMax: item.attributes.tip_max,
  whatsappInviteLink: item.attributes.whatsapp_invite_link,
  coverImageUrl: item.attributes.cover_image_url,
  galleryUrls: item.attributes.gallery_urls ?? [],
});

const mapEnrollmentWithUser = (item: { id: string; attributes: Record<string, string | number | null> }): EnrollmentWithUser => ({
  id: item.id,
  eventId: String(item.attributes.event_id ?? ''),
  userId: String(item.attributes.user_id ?? ''),
  status: (item.attributes.status ?? 'pending') as EnrollmentWithUser['status'],
  tipAmount: typeof item.attributes.tip_amount === 'number' ? item.attributes.tip_amount : null,
  receiptUrl: typeof item.attributes.receipt_url === 'string' ? item.attributes.receipt_url : null,
  rejectionNote: typeof item.attributes.rejection_note === 'string' ? item.attributes.rejection_note : null,
  waitlistPosition: typeof item.attributes.waitlist_position === 'number' ? item.attributes.waitlist_position : null,
  confirmedAt: typeof item.attributes.confirmed_at === 'string' ? item.attributes.confirmed_at : null,
  userName: String(item.attributes.user_name ?? ''),
  userPhone: String(item.attributes.user_phone ?? ''),
  userNeighborhood: String(item.attributes.user_neighborhood ?? ''),
  userEnglishLevel: String(item.attributes.user_english_level ?? ''),
  userAvatarUrl: typeof item.attributes.user_avatar_url === 'string' ? item.attributes.user_avatar_url : null,
});

export const eventService = {
  async getAll(filters?: { type?: EventType }): Promise<CoffeeEvent[]> {
    const params = filters?.type ? `?type=${filters.type}` : '';
    const response = await api.get<{ data: EventApiItem[] }>(`/api/v1/events${params}`);
    return response.data.data.map(mapEvent);
  },
  async getById(id: string): Promise<CoffeeEvent> {
    const response = await api.get<{ data: EventApiItem }>(`/api/v1/events/${id}`);
    return mapEvent(response.data.data);
  },
  async create(data: CreateEventPayload): Promise<CoffeeEvent> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });
    const response = await api.post<{ data: EventApiItem }>('/api/v1/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapEvent(response.data.data);
  },
  async publish(id: string): Promise<CoffeeEvent> {
    const response = await api.post<{ data: EventApiItem }>(`/api/v1/events/${id}/publish`);
    return mapEvent(response.data.data);
  },
  async getParticipants(id: string): Promise<EnrollmentWithUser[]> {
    const response = await api.get<{ data: Array<{ id: string; attributes: Record<string, string | number | null> }> }>(`/api/v1/events/${id}/participants`);
    return response.data.data.map(mapEnrollmentWithUser);
  },
  async addGalleryPhoto(id: string, photo: File): Promise<void> {
    const formData = new FormData();
    formData.append('photo', photo);
    await api.post(`/api/v1/events/${id}/gallery_photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
