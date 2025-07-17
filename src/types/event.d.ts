
export interface EventProfile {
  id: string;
  title: string;
  description?: string;
  date: Date;
  location?: string;
  max_attendees?: number;
  status: EventStatus;
  created_at: Date;
  created_by?: string;
  approved_by?: string;
  approved_at?: Date;
}

export interface EventCreateRequest {
  title: string;
  description?: string;
  date: Date;
  location?: string;
  max_attendees?: number;
  status?: EventStatus;
}

export interface EventUpdateRequest {
  title?: string;
  description?: string;
  date?: Date;
  location?: string;
  max_attendees?: number;
  status?: EventStatus;
}

export interface EventSearchQuery {
  title?: string;
  status?: EventStatus;
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
  limit?: number;
  offset?: number;
}

export interface EventWithStats {
  id: string;
  title: string;
  description?: string;
  date: Date;
  location?: string;
  max_attendees?: number;
  status: EventStatus;
  created_at: Date;
  registration_count: number;
  checkin_count: number;
  is_full: boolean;
  attendance_rate?: number;
}

export interface EventStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  upcoming: number;
  completed: number;
  totalRegistrations: number;
  totalCheckins: number;
  averageAttendance: number;
}

// 活動狀態枚舉
export enum EventStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

// 活動類型枚舉
export enum EventType {
  MEETING = 'meeting',
  SOCIAL = 'social',
  SERVICE = 'service',
  TRAINING = 'training',
  CEREMONY = 'ceremony',
  OTHER = 'other'
}

// 活動管理權限
export interface EventPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canRegister: boolean;
  canCheckin: boolean;
}
