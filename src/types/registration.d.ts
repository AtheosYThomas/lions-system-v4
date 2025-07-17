export interface Registration {
  id: number;
  eventId: number;
  memberId: number;
  status: RegistrationStatus;
  registrationDate: Date;
  notes?: string;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // 關聯資料
  event?: import('./event').Event;
  member?: import('./member').Member;
}

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  WAITLIST = 'waitlist',
  NO_SHOW = 'no_show'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  WAIVED = 'waived'
}

export interface CreateRegistrationRequest {
  eventId: number;
  memberId: number;
  notes?: string;
  paymentAmount?: number;
}

export interface UpdateRegistrationRequest {
  status?: RegistrationStatus;
  notes?: string;
  paymentStatus?: PaymentStatus;
  paymentAmount?: number;
  paymentDate?: Date;
}

export interface RegistrationStats {
  total: number;
  byStatus: Record<RegistrationStatus, number>;
  byPaymentStatus: Record<PaymentStatus, number>;
  totalRevenue: number;
  averageRegistrationsPerEvent: number;
  cancellationRate: number;
}

export interface RegistrationSearchParams {
  eventId?: number;
  memberId?: number;
  status?: RegistrationStatus;
  paymentStatus?: PaymentStatus;
  registrationDateFrom?: Date;
  registrationDateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface BulkRegistrationRequest {
  eventId: number;
  memberIds: number[];
  notes?: string;
}

export interface RegistrationSummary {
  eventId: number;
  eventTitle: string;
  totalRegistrations: number;
  confirmedRegistrations: number;
  revenue: number;
  availableSpots: number;
}