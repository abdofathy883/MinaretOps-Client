import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import {
  AttendanceRecord,
  AttendanceStatus,
  LeaveRequest,
  LeaveStatus,
  NewAttendanceRecord,
  NewLeaveRequest,
} from '../../model/attendance-record/attendance-record';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private endpoint: string = 'attendance';
  constructor(private api: ApiService) {}

  checkIn(attendanceRecoed: NewAttendanceRecord): Observable<AttendanceRecord> {
    return this.api.post<AttendanceRecord>(
      `${this.endpoint}/new-attendance`,
      attendanceRecoed
    );
  }

  getAttendanceByEmployeeId(employeeId: string): Observable<AttendanceRecord[]> {
    return this.api.get<AttendanceRecord[]>(
      `${this.endpoint}/employee-attendance/${employeeId}`
    );
  }

  getAllAttendance(): Observable<AttendanceRecord[]> {
    return this.api.get<AttendanceRecord[]>(`${this.endpoint}/all-attendance`);
  }

  getTodayAttendanceByEmployeeId(employeeId: string): Observable<AttendanceRecord>{
    return this.api.get<AttendanceRecord>(`${this.endpoint}/today-attendance/${employeeId}`);
  }

  changeAttendanceStatus(
    adminId: string,
    recordId: number,
    newStatus: AttendanceStatus
  ): Observable<AttendanceRecord> {
    return this.api.put<AttendanceRecord>(
      `${this.endpoint}/admin-change-attendance/${adminId}/${recordId}`,
      newStatus
    );
  }

  // Leave Requests

  newLeaveRequest(request: NewLeaveRequest): Observable<LeaveRequest> {
    return this.api.post<LeaveRequest>(
      `${this.endpoint}/submit-leave-request`,
      request
    );
  }

  getRequestsByEmployeeId(empId: string): Observable<LeaveRequest[]> {
    return this.api.get<LeaveRequest[]>(
      `${this.endpoint}/employee-leave-requests/${empId}`
    );
  }

  getAllRequests(): Observable<LeaveRequest[]> {
    return this.api.get<LeaveRequest[]>(`${this.endpoint}/all-leave-requests`);
  }

  changeLeaveRequestStatus(
    adminId: string,
    requestId: number,
    newStatus: LeaveStatus
  ): Observable<LeaveRequest> {
    return this.api.put<LeaveRequest>(
      `${this.endpoint}/admin-change-leave-request/${adminId}/${requestId}`,
      newStatus
    );
  }
}
