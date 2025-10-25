export interface AttendanceRecord {
    id: number;
    employeeId: string;
    employeeName: string;
    clockIn: Date;
    clockOut: Date;
    workDate: string;
    totalWorkingTime?: string;
    totalBreakTime?: string;
    status: AttendanceStatus;
    missingClockOut?: boolean;
    earlyLeave: boolean;
    breakPeriods: BreakPeriod[];
}

export interface AttendanceFilter {
  fromDate?: string;
  toDate?: string;
  employeeId?: string;
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedAttendanceResult {
  records: AttendanceRecord[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface BreakPeriod {
    id: number;
    attendanceRecordId: number;
    startTime: Date;
    endTime?: Date;
    duration?: string;
}

export interface NewAttendanceRecord {
    employeeId: string;
    deviceId: string;
    ipAddress: string;
}

export enum AttendanceStatus {
    Present = 0,
    Absent = 1,
    Leave = 2
}

export interface ToggleEarlyLeave {
    employeeId: string;
    workDate: string;
}

export interface LeaveRequest {
    id: number;
    employeeId: string;
    employeeName: string;
    fromDate: Date;
    toDate: Date;
    status: LeaveStatus;
    actionDate: Date;
}

export interface NewLeaveRequest {
    employeeId: string;
    fromDate: Date;
    toDate: Date;
    type: LeaveType;
    reason: string;
    proofFile: File;
}

export enum LeaveStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

export enum LeaveType {
    Annual = 0,
    Sick = 1
}
