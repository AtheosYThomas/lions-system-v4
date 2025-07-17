export interface Checkin {
  id: number;
  eventId: number;
  memberId: number;
  checkinTime: Date;
  status: CheckinStatus;
  location?: string;
  notes?: string;
  verifiedBy?: number;
  createdAt: Date;
  updatedAt: Date;

  // 關聯資料
  event?: import('./event').Event;
  member?: import('./member').Member;
  verifier?: import('./member').Member;
}

export enum CheckinStatus {
  CHECKED_IN = 'checked_in',
  LATE = 'late',
  EARLY_DEPARTURE = 'early_departure',
  ABSENT = 'absent',
  EXCUSED = 'excused'
}

export interface CreateCheckinRequest {
  eventId: number;
  memberId: number;
  location?: string;
  notes?: string;
}

export interface UpdateCheckinRequest {
  status?: CheckinStatus;
  location?: string;
  notes?: string;
  verifiedBy?: number;
}

export interface CheckinStats {
  total: number;
  byStatus: Record<CheckinStatus, number>;
  attendanceRate: number;
  averageCheckinTime: string;
  lateArrivals: number;
  earlyDepartures: number;
}

export interface CheckinSearchParams {
  eventId?: number;
  memberId?: number;
  status?: CheckinStatus;
  checkinDateFrom?: Date;
  checkinDateTo?: Date;
  verifiedBy?: number;
  limit?: number;
  offset?: number;
}

export interface BulkCheckinRequest {
  eventId: number;
  memberIds: number[];
  location?: string;
}

export interface CheckinSummary {
  eventId: number;
  eventTitle: string;
  totalExpected: number;
  totalCheckedIn: number;
  attendanceRate: number;
  lateCount: number;
}