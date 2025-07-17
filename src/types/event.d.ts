export interface Event {
  id: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: EventStatus;
  type: EventType;
  requiresRegistration: boolean;
  registrationDeadline?: Date;
  fee?: number;
  organizer: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum EventType {
  MEETING = 'meeting',
  SOCIAL = 'social',
  SERVICE = 'service',
  FUNDRAISING = 'fundraising',
  TRAINING = 'training',
  OTHER = 'other'
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  maxParticipants?: number;
  type: EventType;
  requiresRegistration: boolean;
  registrationDeadline?: Date;
  fee?: number;
  organizer: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  maxParticipants?: number;
  status?: EventStatus;
  type?: EventType;
  requiresRegistration?: boolean;
  registrationDeadline?: Date;
  fee?: number;
  organizer?: string;
}

export interface EventStats {
  total: number;
  byStatus: Record<EventStatus, number>;
  byType: Record<EventType, number>;
  totalParticipants: number;
  averageParticipants: number;
  upcomingEvents: number;
}

export interface EventSearchParams {
  title?: string;
  status?: EventStatus;
  type?: EventType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}