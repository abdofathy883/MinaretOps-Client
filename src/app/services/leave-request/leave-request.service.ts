import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { LeaveRequest, LeaveStatus, NewLeaveRequest } from '../../model/attendance-record/attendance-record';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {
  private endpoint = 'leaverequest';
  constructor(private api: ApiService) { }

  newLeaveRequest(request: FormData): Observable<LeaveRequest> {
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
