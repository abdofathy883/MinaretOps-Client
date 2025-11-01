import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { TaskEmployeeReport } from '../../model/reporting/i-task-employee-report';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private endpoint = 'reporting';
  constructor(private api: ApiService) { }

  getTaskEmployeeReport(currentUserId: string): Observable<TaskEmployeeReport> {
    return this.api.get<TaskEmployeeReport>(`${this.endpoint}/task-employee-report?currentUserId=${currentUserId}`);
  }
}
