export interface Checkin {
  id: string;
  eventId: string;
  memberId: string;
  checkinTime: Date;
  status: CheckinStatus;
  location?: string;
  notes?: string;
  verified_by?: string;
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
  eventId: string;
  memberId: string;
  location?: string;
  notes?: string;
}

export interface UpdateCheckinRequest {
  status?: CheckinStatus;
  location?: string;
  notes?: string;
  verified_by?: string;
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
  eventId?: string;
  memberId?: string;
  status?: CheckinStatus;
  checkinDateFrom?: Date;
  checkinDateTo?: Date;
  verified_by?: string;
  limit?: number;
  offset?: number;
}

export interface BulkCheckinRequest {
  eventId: string;
  memberIds: string[];
  location?: string;
}

export interface CheckinSummary {
  eventId: string;
  eventTitle: string;
  totalExpected: number;
  totalCheckedIn: number;
  attendanceRate: number;
  lateCount: number;
}