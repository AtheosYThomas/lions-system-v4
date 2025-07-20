export interface Checkin {
  id: string;
  event_id: string;
  member_id: string;
  checkin_time: Date;
  status: CheckinStatus;
  location?: string;
  notes?: string;
  verified_by?: string;
  created_at: Date;
  updated_at: Date;

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
  EXCUSED = 'excused',
}

export interface CreateCheckinRequest {
  event_id: string;
  member_id: string;
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
  event_id?: string;
  member_id?: string;
  status?: CheckinStatus;
  checkin_date_from?: Date;
  checkin_date_to?: Date;
  verified_by?: string;
  limit?: number;
  offset?: number;
}

export interface BulkCheckinRequest {
  event_id: string;
  member_ids: string[];
  location?: string;
}

export interface CheckinSummary {
  event_id: string;
  event_title: string;
  total_expected: number;
  total_checked_in: number;
  attendance_rate: number;
  late_count: number;
}
