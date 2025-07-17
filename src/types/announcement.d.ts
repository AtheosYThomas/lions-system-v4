export interface Announcement {
  id: number;
  title: string;
  content: string;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  targetAudience: TargetAudience;
  scheduledTime?: Date;
  publishedTime?: Date;
  expiryTime?: Date;
  authorId: number;
  isSticky: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;

  // 關聯資料
  author?: import('./member').Member;
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum AnnouncementPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum AnnouncementCategory {
  GENERAL = 'general',
  EVENT = 'event',
  MEETING = 'meeting',
  EMERGENCY = 'emergency',
  POLICY = 'policy',
  SOCIAL = 'social'
}

export enum TargetAudience {
  ALL = 'all',
  MEMBERS_ONLY = 'members_only',
  BOARD_ONLY = 'board_only',
  COMMITTEE = 'committee',
  NEW_MEMBERS = 'new_members'
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  targetAudience: TargetAudience;
  scheduledTime?: Date;
  expiryTime?: Date;
  isSticky?: boolean;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  status?: AnnouncementStatus;
  priority?: AnnouncementPriority;
  category?: AnnouncementCategory;
  targetAudience?: TargetAudience;
  scheduledTime?: Date;
  expiryTime?: Date;
  isSticky?: boolean;
}

export interface AnnouncementStats {
  total: number;
  byStatus: Record<AnnouncementStatus, number>;
  byPriority: Record<AnnouncementPriority, number>;
  byCategory: Record<AnnouncementCategory, number>;
  totalViews: number;
  averageViews: number;
  recentAnnouncements: number;
}

export interface AnnouncementSearchParams {
  title?: string;
  status?: AnnouncementStatus;
  priority?: AnnouncementPriority;
  category?: AnnouncementCategory;
  targetAudience?: TargetAudience;
  authorId?: number;
  publishedAfter?: Date;
  publishedBefore?: Date;
  limit?: number;
  offset?: number;
}

export interface BulkAnnouncementOperation {
  announcementIds: number[];
  action: 'publish' | 'archive' | 'delete';
  scheduledTime?: Date;
}