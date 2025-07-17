
export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  line_uid?: string;
  role: MemberRole;
  phone?: string;
  english_name?: string;
  birthday: string;
  job_title: string;
  fax?: string;
  address: string;
  mobile: string;
  status: MemberStatus;
  created_at: Date;
}

export interface MemberCreateRequest {
  name: string;
  email: string;
  line_uid?: string;
  phone?: string;
  english_name?: string;
  birthday: string;
  job_title: string;
  fax?: string;
  address: string;
  mobile: string;
  role?: MemberRole;
  status?: MemberStatus;
}

export interface MemberUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  english_name?: string;
  birthday?: string;
  job_title?: string;
  fax?: string;
  address?: string;
  mobile?: string;
  role?: MemberRole;
  status?: MemberStatus;
}

export interface MemberSearchQuery {
  name?: string;
  email?: string;
  role?: MemberRole;
  status?: MemberStatus;
  limit?: number;
  offset?: number;
}

export interface MemberStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  archived: number;
  byRole: Record<MemberRole, number>;
}

// 會員角色枚舉
export enum MemberRole {
  GUEST = 'guest',
  MEMBER = 'member',
  OFFICER = 'officer',
  PRESIDENT = 'president',
  ADMIN = 'admin'
}

// 會員狀態枚舉
export enum MemberStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived'
}

// 會員權限檢查
export interface MemberPermissions {
  canCreateEvent: boolean;
  canEditEvent: boolean;
  canDeleteEvent: boolean;
  canManageMembers: boolean;
  canViewAdminPanel: boolean;
  canCreateAnnouncement: boolean;
  canApproveContent: boolean;
}
