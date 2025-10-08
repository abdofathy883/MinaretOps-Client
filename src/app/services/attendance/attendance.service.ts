import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import {
  AttendanceRecord,
  AttendanceStatus,
  NewAttendanceRecord,
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
      attendanceRecoed
    );
  }

  clockOut(empId: string): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/clock-out/${empId}`, null);
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

}
