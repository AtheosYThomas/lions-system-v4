export interface Registration {
  id: number;
  event_id: number;
  member_id: number;
  status: RegistrationStatus;
  registration_date: Date;
  notes?: string;
  payment_status: PaymentStatus;
  payment_amount?: number;
  payment_date?: Date;
  created_at: Date;
  updated_at: Date;

  // 關聯資料
  event?: import('./event').Event;
  member?: import('./member').Member;
}

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  WAITLIST = 'waitlist',
  NO_SHOW = 'no_show',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  WAIVED = 'waived',
}

export interface CreateRegistrationRequest {
  event_id: number;
  member_id: number;
  notes?: string;
  payment_amount?: number;
}

export interface UpdateRegistrationRequest {
  status?: RegistrationStatus;
  notes?: string;
  payment_status?: PaymentStatus;
  payment_amount?: number;
  payment_date?: Date;
}

export interface RegistrationStats {
  total: number;
  byStatus: Record<RegistrationStatus, number>;
  byPaymentStatus: Record<PaymentStatus, number>;
  total_revenue: number;
  average_registrations_per_event: number;
  cancellation_rate: number;
}

export interface RegistrationSearchParams {
  event_id?: number;
  member_id?: number;
  status?: RegistrationStatus;
  payment_status?: PaymentStatus;
  registration_date_from?: Date;
  registration_date_to?: Date;
  limit?: number;
  offset?: number;
}

export interface BulkRegistrationRequest {
  event_id: number;
  member_ids: number[];
  notes?: string;
}

export interface RegistrationSummary {
  event_id: number;
  event_title: string;
  total_registrations: number;
  confirmed_registrations: number;
  revenue: number;
  available_spots: number;
}
