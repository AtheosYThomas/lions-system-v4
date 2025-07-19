
import { Request } from 'express';

// ✅ Interface 建立區（src/types/entities.ts）

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export interface PushRecordAttributes {
  id: string;
  member_id: string;
  event_id: string;
  message_type: string;
  status: 'success' | 'failed';
  pushed_at: Date;
  error_message?: string;
}

export interface PushRecordCreationAttributes extends Omit<PushRecordAttributes, 'id' | 'pushed_at'> {}

export interface RegistrationInput {
  memberId: string;
  eventId: string;
  name: string;
  companions?: number;
  shuttle?: boolean;
}

export interface PushPayload {
  userId: string;
  content: string;
  timestamp: number;
}

export interface MemberAttributes {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  line_user_id?: string;
  status: string;
}

export interface UploadFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
  buffer?: Buffer;
}

export interface EventInput {
  title: string;
  description?: string;
  date: string;
  location?: string;
  max_attendees?: number;
  status?: 'active' | 'cancelled' | 'completed';
}

export interface CheckinRecord {
  id: string;
  member_id: string;
  event_id: string;
  checkin_time: Date;
  device_info?: string;
}

export interface AnnouncementInput {
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event';
  author_id: string;
  published_at?: Date;
  audience?: 'all' | 'officers' | 'members';
  category?: 'event' | 'system' | 'personnel';
}
