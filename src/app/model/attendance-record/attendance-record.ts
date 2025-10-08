export interface AttendanceRecord {
    employeeId: string;
    employeeName: string;
    clockIn: Date;
    clockOut: Date;
    status: AttendanceStatus;
}

export interface NewAttendanceRecord {
    employeeId: string;
    deviceId: string;
    ipAddress: string;
}

export enum AttendanceStatus {
    Present = 0,
    Absent = 1,
    Leave = 2,
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
