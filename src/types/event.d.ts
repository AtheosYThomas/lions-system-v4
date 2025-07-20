export interface Event {
  id: number;
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  location: string;
  max_participants?: number;
  current_participants: number;
  status: EventStatus;
  type: EventType;
  requires_registration: boolean;
  registration_deadline?: Date;
  fee?: number;
  organizer: string;
  created_at: Date;
  updated_at: Date;
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EventType {
  MEETING = 'meeting',
  SOCIAL = 'social',
  SERVICE = 'service',
  FUNDRAISING = 'fundraising',
  TRAINING = 'training',
  OTHER = 'other',
}

export interface CreateEventRequest {
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  location: string;
  max_participants?: number;
  type: EventType;
  requires_registration: boolean;
  registration_deadline?: Date;
  fee?: number;
  organizer: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  start_time?: Date;
  end_time?: Date;
  location?: string;
  max_participants?: number;
  status?: EventStatus;
  type?: EventType;
  requires_registration?: boolean;
  registration_deadline?: Date;
  fee?: number;
  organizer?: string;
}

export interface EventStats {
  total: number;
  byStatus: Record<EventStatus, number>;
  byType: Record<EventType, number>;
  total_participants: number;
  average_participants: number;
  upcoming_events: number;
}

export interface EventSearchParams {
  title?: string;
  status?: EventStatus;
  type?: EventType;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}
