import { api } from './api';
import type { Enrollment } from '../types/enrollment.types';

interface EnrollmentApiItem {
  id: string;
  type: 'enrollments';
  attributes: {
    event_id: string;
    user_id: string;
    status: Enrollment['status'];
    tip_amount: number | null;
    receipt_url: string | null;
    rejection_note: string | null;
    waitlist_position: number | null;
    confirmed_at: string | null;
  };
}

const mapEnrollment = (item: EnrollmentApiItem): Enrollment => ({
  id: item.id,
  eventId: item.attributes.event_id,
  userId: item.attributes.user_id,
  status: item.attributes.status,
  tipAmount: item.attributes.tip_amount,
  receiptUrl: item.attributes.receipt_url,
  rejectionNote: item.attributes.rejection_note,
  waitlistPosition: item.attributes.waitlist_position,
  confirmedAt: item.attributes.confirmed_at,
});

export const enrollmentService = {
  async getMine(): Promise<Enrollment[]> {
    const response = await api.get<{ data: EnrollmentApiItem[] }>('/api/v1/enrollments');
    return response.data.data.map(mapEnrollment);
  },
  async create(eventId: string, tipAmount: number, receipt: File): Promise<Enrollment> {
    const formData = new FormData();
    formData.append('event_id', eventId);
    formData.append('tip_amount', tipAmount.toString());
    formData.append('receipt', receipt);
    const response = await api.post<{ data: EnrollmentApiItem }>('/api/v1/enrollments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapEnrollment(response.data.data);
  },
  async verify(id: string, action: 'confirm' | 'reject', rejectionNote?: string): Promise<Enrollment> {
    const response = await api.post<{ data: EnrollmentApiItem }>(`/api/v1/enrollments/${id}/verify`, {
      action,
      rejection_note: rejectionNote,
    });
    return mapEnrollment(response.data.data);
  },
  async cancel(id: string): Promise<void> {
    await api.delete(`/api/v1/enrollments/${id}`);
  },
};
