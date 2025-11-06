import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { MonthlyAttendanceReport, TaskEmployeeReport } from '../../model/reporting/i-task-employee-report';
import { Observable } from 'rxjs';
import { AttendanceStatus } from '../../model/attendance-record/attendance-record';

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private endpoint = 'reporting';
  constructor(private api: ApiService) { }

  getTaskEmployeeReport(currentUserId: string, fromDate?: Date, toDate?: Date): Observable<TaskEmployeeReport> {
    let url = `${this.endpoint}/task-employee-report?currentUserId=${currentUserId}`;
    
    // Add date parameters if provided
    if (fromDate) {
      url += `&fromDate=${this.formatDate(fromDate)}`;
    }
    if (toDate) {
      url += `&toDate=${this.formatDate(toDate)}`;
    }
    
    return this.api.get<TaskEmployeeReport>(url);
  }

  getMonthlyAttendanceReport(fromDate: Date, toDate: Date, status?: AttendanceStatus | null): Observable<MonthlyAttendanceReport> {
    // Format dates as YYYY-MM-DD
    const fromDateStr = this.formatDate(fromDate);
    const toDateStr = this.formatDate(toDate);
    
    let url = `${this.endpoint}/monthly-attendance-report?fromDate=${fromDateStr}&toDate=${toDateStr}`;
    
    // Add status parameter if provided
    if (status !== null && status !== undefined) {
      url += `&status=${status}`;
    }
    
    return this.api.get<MonthlyAttendanceReport>(url);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
