import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import {
  AttendanceFilter,
  AttendanceRecord,
  AttendanceStatus,
  BreakPeriod,
  NewAttendanceRecord,
  PaginatedAttendanceResult,
  ToggleEarlyLeave,
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
      `${this.endpoint}/clock-in`,
      attendanceRecoed,
    );
  }

  clockOut(): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/clock-out`, null);
  }

  getAttendanceByEmployeeId(): Observable<AttendanceRecord[]> {
    return this.api.get<AttendanceRecord[]>(
      `${this.endpoint}/employee-attendance`,
    );
  }

  // getAllAttendance(date: string): Observable<AttendanceRecord[]> {
  //   return this.api.get<AttendanceRecord[]>(`${this.endpoint}/all-attendance?date=${date}`);
  // }

  getPaginatedAttendance(
    filter: AttendanceFilter,
  ): Observable<PaginatedAttendanceResult> {
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

  getTodayAttendanceByEmployeeId(): Observable<AttendanceRecord> {
    return this.api.get<AttendanceRecord>(`${this.endpoint}/today-attendance`);
  }

  changeAttendanceStatus(
    recordId: number,
    newStatus: AttendanceStatus,
  ): Observable<AttendanceRecord> {
    return this.api.put<AttendanceRecord>(
      `${this.endpoint}/admin-change-attendance/${recordId}`,
      newStatus,
    );
  }

  startBreak(): Observable<BreakPeriod> {
    return this.api.post<BreakPeriod>(`${this.endpoint}/start-break`, null);
  }

  endBreak(): Observable<BreakPeriod> {
    return this.api.post<BreakPeriod>(`${this.endpoint}/end-break`, null);
  }

  getActiveBreak(): Observable<BreakPeriod | null> {
    return this.api.get<BreakPeriod | null>(`${this.endpoint}/active-break`);
  }

  toggleEarlyLeave(earlyLeave: ToggleEarlyLeave): Observable<any> {
    return this.api.put<any>(`${this.endpoint}/submit-early-leave`, earlyLeave);
  }
}
