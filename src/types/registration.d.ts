
export interface RegistrationProfile {
  id: string;
  event_id: string;
  member_id: string;
  registration_date: Date;
  status: RegistrationStatus;
  created_at: Date;
  notes?: string;
  num_attendees?: number;
}

export interface RegistrationCreateRequest {
  event_id: string;
  member_id: string;
  notes?: string;
  num_attendees?: number;
  status?: RegistrationStatus;
}

export interface RegistrationUpdateRequest {
  status?: RegistrationStatus;
  notes?: string;
  num_attendees?: number;
}

export interface RegistrationWithDetails {
  id: string;
  event_id: string;
  member_id: string;
  registration_date: Date;
  status: RegistrationStatus;
  created_at: Date;
  notes?: string;
  num_attendees?: number;
  event?: {
    id: string;
    title: string;
    date: Date;
    location?: string;
  };
  member?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface RegistrationSearchQuery {
  event_id?: string;
  member_id?: string;
  status?: RegistrationStatus;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface RegistrationStats {
  total: number;
  confirmed: number;
  cancelled: number;
  pending: number;
  waitlisted: number;
  byEvent: Record<string, number>;
  byMember: Record<string, number>;
  recentRegistrations: number;
}

export interface BulkRegistrationRequest {
  event_id: string;
  member_ids: string[];
  notes?: string;
  num_attendees?: number;
}

export interface BulkRegistrationResult {
  success: number;
  failed: number;
  errors: Array<{
    member_id: string;
    error: string;
  }>;
}

// 報名狀態枚舉
export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  WAITLISTED = 'waitlisted',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show'
}

// 報名驗證規則
export interface RegistrationValidation {
  isEventActive: boolean;
  hasCapacity: boolean;
  isNotDuplicate: boolean;
  isMemberEligible: boolean;
  isWithinDeadline: boolean;
}

// 報名匯出格式
export interface RegistrationExport {
  event_title: string;
  member_name: string;
  member_email: string;
  registration_date: string;
  status: string;
  notes?: string;
  num_attendees?: number;
}
