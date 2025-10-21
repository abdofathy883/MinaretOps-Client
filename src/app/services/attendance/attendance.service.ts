import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import {
  AttendanceFilter,
  AttendanceRecord,
  AttendanceStatus,
  BreakPeriod,
  NewAttendanceRecord,
  PaginatedAttendanceResult,
} from '../../model/attendance-record/attendance-record';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private endpoint: string = 'attendance';
  constructor(private api: ApiService) {}

  checkIn(attendanceRecoed: NewAttendanceRecord): Observable<AttendanceRecord> {
    return this.api.post<AttendanceRecord>(
      `${this.endpoint}/clock-in`,
      attendanceRecoed
    );
  }

  clockOut(empId: string): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/clock-out/${empId}`, null);
  }

  getAttendanceByEmployeeId(
    employeeId: string
  ): Observable<AttendanceRecord[]> {
    return this.api.get<AttendanceRecord[]>(
      `${this.endpoint}/employee-attendance/${employeeId}`
    );
  }

  // getAllAttendance(date: string): Observable<AttendanceRecord[]> {
  //   return this.api.get<AttendanceRecord[]>(`${this.endpoint}/all-attendance?date=${date}`);
  // }

  getPaginatedAttendance(filter: AttendanceFilter): Observable<PaginatedAttendanceResult> {
    let url = `${this.endpoint}/paginated?pageNumber=${filter.pageNumber}&pageSize=${filter.pageSize}`;
  
    if (filter.fromDate) {
      url += `&fromDate=${filter.fromDate}`;
    }
    if (filter.toDate) {
      url += `&toDate=${filter.toDate}`;
    }
    if (filter.employeeId) {
      url += `&employeeId=${filter.employeeId}`;
    }
  
    return this.api.get<PaginatedAttendanceResult>(url);
  }

  getTodayAttendanceByEmployeeId(
    employeeId: string
  ): Observable<AttendanceRecord> {
    return this.api.get<AttendanceRecord>(
      `${this.endpoint}/today-attendance/${employeeId}`
    );
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

  startBreak(employeeId: string): Observable<BreakPeriod> {
    return this.api.post<BreakPeriod>(`${this.endpoint}/start-break`, {
      employeeId: employeeId,
    });
  }

  endBreak(employeeId: string): Observable<BreakPeriod> {
    return this.api.post<BreakPeriod>(`${this.endpoint}/end-break`, {
      employeeId: employeeId,
    });
  }

  getActiveBreak(employeeId: string): Observable<BreakPeriod | null> {
    return this.api.get<BreakPeriod | null>(
      `${this.endpoint}/active-break/${employeeId}`
    );
  }
}

