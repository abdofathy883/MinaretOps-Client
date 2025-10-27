import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { AttendanceDashboard } from '../../model/attendance-record/attendance-record';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceDashboardService {
  private endpoint = 'attendancedashboard';
  constructor(private api: ApiService) { }

  getAttendanceDashboard(): Observable<AttendanceDashboard> {
  return this.api.get<AttendanceDashboard>(`${this.endpoint}/dashboard`);
}
}
