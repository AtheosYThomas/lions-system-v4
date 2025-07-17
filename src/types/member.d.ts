export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  lineUid?: string;
  membershipType: MembershipType;
  status: MemberStatus;
  joinDate: Date;
  lastActiveDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MembershipType {
  REGULAR = 'regular',
  HONORARY = 'honorary',
  LIFE = 'life',
  ASSOCIATE = 'associate'
}

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface CreateMemberRequest {
  name: string;
  email: string;
  phone: string;
  lineUid?: string;
  membershipType: MembershipType;
  notes?: string;
}

export interface UpdateMemberRequest {
  name?: string;
  email?: string;
  phone?: string;
  lineUid?: string;
  membershipType?: MembershipType;
  status?: MemberStatus;
  notes?: string;
}

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<MembershipType, number>;
  recentJoins: number;
}

export interface MemberSearchParams {
  name?: string;
  email?: string;
  status?: MemberStatus;
  membershipType?: MembershipType;
  limit?: number;
  offset?: number;
}