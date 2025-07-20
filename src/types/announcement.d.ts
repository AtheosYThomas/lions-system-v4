export interface Announcement {
  id: number;
  title: string;
  content: string;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  target_audience: TargetAudience;
  scheduled_time?: Date;
  published_time?: Date;
  expiry_time?: Date;
  author_id: number;
  is_sticky: boolean;
  view_count: number;
  created_at: Date;
  updated_at: Date;

  // 關聯資料
  author?: import('./member').Member;
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum AnnouncementPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AnnouncementCategory {
  GENERAL = 'general',
  EVENT = 'event',
  MEETING = 'meeting',
  EMERGENCY = 'emergency',
  POLICY = 'policy',
  SOCIAL = 'social',
}

export enum TargetAudience {
  ALL = 'all',
  MEMBERS_ONLY = 'members_only',
  BOARD_ONLY = 'board_only',
  COMMITTEE = 'committee',
  NEW_MEMBERS = 'new_members',
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  target_audience: TargetAudience;
  scheduled_time?: Date;
  expiry_time?: Date;
  is_sticky?: boolean;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  status?: AnnouncementStatus;
  priority?: AnnouncementPriority;
  category?: AnnouncementCategory;
  target_audience?: TargetAudience;
  scheduled_time?: Date;
  expiry_time?: Date;
  is_sticky?: boolean;
}

export interface AnnouncementStats {
  total: number;
  byStatus: Record<AnnouncementStatus, number>;
  byPriority: Record<AnnouncementPriority, number>;
  byCategory: Record<AnnouncementCategory, number>;
  total_views: number;
  average_views: number;
  recent_announcements: number;
}

export interface AnnouncementSearchParams {
  title?: string;
  status?: AnnouncementStatus;
  priority?: AnnouncementPriority;
  category?: AnnouncementCategory;
  target_audience?: TargetAudience;
  author_id?: number;
  published_after?: Date;
  published_before?: Date;
  limit?: number;
  offset?: number;
}

export interface BulkAnnouncementOperation {
  announcement_ids: number[];
  action: 'publish' | 'archive' | 'delete';
  scheduled_time?: Date;
}
