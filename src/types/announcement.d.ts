
export interface AnnouncementProfile {
  id: string;
  title: string;
  content: string;
  related_event_id?: string;
  created_by?: string;
  audience: AnnouncementAudience;
  category: AnnouncementCategory;
  status: AnnouncementStatus;
  scheduled_at?: Date;
  published_at?: Date;
  is_visible: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AnnouncementCreateRequest {
  title: string;
  content: string;
  related_event_id?: string;
  audience?: AnnouncementAudience;
  category?: AnnouncementCategory;
  status?: AnnouncementStatus;
  scheduled_at?: Date;
  is_visible?: boolean;
}

export interface AnnouncementUpdateRequest {
  title?: string;
  content?: string;
  related_event_id?: string;
  audience?: AnnouncementAudience;
  category?: AnnouncementCategory;
  status?: AnnouncementStatus;
  scheduled_at?: Date;
  is_visible?: boolean;
}

export interface AnnouncementWithDetails {
  id: string;
  title: string;
  content: string;
  related_event_id?: string;
  created_by?: string;
  audience: AnnouncementAudience;
  category: AnnouncementCategory;
  status: AnnouncementStatus;
  scheduled_at?: Date;
  published_at?: Date;
  is_visible: boolean;
  created_at: Date;
  updated_at: Date;
  event?: {
    id: string;
    title: string;
    date: Date;
  };
  creator?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface AnnouncementSearchQuery {
  title?: string;
  category?: AnnouncementCategory;
  status?: AnnouncementStatus;
  audience?: AnnouncementAudience;
  created_by?: string;
  related_event_id?: string;
  dateFrom?: Date;
  dateTo?: Date;
  is_visible?: boolean;
  limit?: number;
  offset?: number;
}

export interface AnnouncementStats {
  total: number;
  draft: number;
  scheduled: number;
  published: number;
  byCategory: Record<AnnouncementCategory, number>;
  byAudience: Record<AnnouncementAudience, number>;
  recentPublished: number;
  scheduledToday: number;
}

export interface BulkAnnouncementOperation {
  announcement_ids: string[];
  action: 'publish' | 'archive' | 'delete' | 'schedule';
  scheduled_at?: Date;
}

// 公告對象枚舉
export enum AnnouncementAudience {
  ALL = 'all',
  OFFICERS = 'officers',
  MEMBERS = 'members'
}

// 公告分類枚舉
export enum AnnouncementCategory {
  EVENT = 'event',
  SYSTEM = 'system',
  PERSONNEL = 'personnel',
  GENERAL = 'general',
  URGENT = 'urgent'
}

// 公告狀態枚舉
export enum AnnouncementStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// 公告發布格式
export interface AnnouncementPublishFormat {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  category: AnnouncementCategory;
  publish_time: Date;
  related_links?: string[];
  attachments?: string[];
}

// 公告通知設定
export interface AnnouncementNotificationSettings {
  send_line_notification: boolean;
  send_email_notification: boolean;
  target_audience: AnnouncementAudience;
  notification_template?: string;
}

// 公告權限檢查
export interface AnnouncementPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canSchedule: boolean;
  canManageAll: boolean;
}
