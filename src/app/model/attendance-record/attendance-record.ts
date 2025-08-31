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

}

export interface NewLeaveRequest {

}

export enum LeaveStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2
}
