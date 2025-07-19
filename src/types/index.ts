// Member types
export * from './member';

// Event types  
export * from './event';

// Registration types
// 全域註冊型別  
export { RegistrationStatus } from './registration';
export { PaymentStatus, PaymentMethod } from './payment';

// Announcement types
export * from './announcement';

// LINE types
export * from './line';

// Checkin types
export * from './checkin';

// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface SystemStats {
  members: {
    total: number;
    active: number;
  };
  events: {
    total: number;
    upcoming: number;
  };
  registrations: {
    total: number;
    thisMonth: number;
  };
  announcements: {
    total: number;
    published: number;
  };
}

// Push Record with relations type
export interface PushRecordWithRelations {
  id: string;
  member_id: string;
  event_id: string;
  message_type: string;
  status: string;
  pushed_at: Date;
  member?: {
    id: string;
    name: string;
    line_user_id?: string;
  };
  event?: {
    id: string;
    title: string;
    date: Date;
    location?: string;
  };
}

// Export all type definitions
export * from './announcement.d';
export * from './checkin.d';
export * from './event.d';
export * from './member.d';
export * from './payment';
export * from './registration.d';
export * from './line';
export * from './role';