export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  line_uid?: string;
  membership_type: MembershipType;
  status: MemberStatus;
  join_date: Date;
  last_active_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export enum MembershipType {
  REGULAR = 'regular',
  HONORARY = 'honorary',
  LIFE = 'life',
  ASSOCIATE = 'associate',
}

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export interface CreateMemberRequest {
  name: string;
  email: string;
  phone: string;
  line_uid?: string;
  membership_type: MembershipType;
  notes?: string;
}

export interface UpdateMemberRequest {
  name?: string;
  email?: string;
  phone?: string;
  line_uid?: string;
  membership_type?: MembershipType;
  status?: MemberStatus;
  notes?: string;
}

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<MembershipType, number>;
  recent_joins: number;
}

export interface MemberSearchParams {
  name?: string;
  email?: string;
  status?: MemberStatus;
  membership_type?: MembershipType;
  limit?: number;
  offset?: number;
}
