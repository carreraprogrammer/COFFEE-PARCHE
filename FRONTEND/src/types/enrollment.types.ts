export type EnrollmentStatus = 'pending' | 'confirmed' | 'rejected' | 'waitlisted' | 'cancelled';

export interface Enrollment {
  id: string;
  eventId: string;
  userId: string;
  status: EnrollmentStatus;
  tipAmount: number | null;
  receiptUrl: string | null;
  rejectionNote: string | null;
  waitlistPosition: number | null;
  confirmedAt: string | null;
}

export interface EnrollmentWithUser extends Enrollment {
  userName: string;
  userPhone: string;
  userNeighborhood: string;
  userEnglishLevel: string;
  userAvatarUrl: string | null;
}

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  pending: '⏳ Pendiente',
  confirmed: '✅ Confirmado',
  rejected: '❌ Rechazado',
  waitlisted: '🕐 Lista de espera',
  cancelled: '🚫 Cancelado',
};
