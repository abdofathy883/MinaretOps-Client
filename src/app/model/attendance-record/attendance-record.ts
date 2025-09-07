export interface AttendanceRecord {
    employeeId: string;
    employeeName: string;
    checkInTime: Date;
    status: AttendanceStatus;
    deviceId: string;
    ipAddress: string;
}

export interface NewAttendanceRecord {
    employeeId: string;
    checkInTime: Date;
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
    date: Date;
    status: LeaveStatus;
    actionDate: Date;
}

export interface NewLeaveRequest {
    employeeId: string;
    date: Date;
}

export enum LeaveStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2
}
