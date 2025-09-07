import { Component, OnInit } from '@angular/core';
import { LeaveRequest, LeaveStatus } from '../../../model/attendance-record/attendance-record';
import { AttendanceService } from '../../../services/attendance/attendance.service';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-all-leave-requests',
  imports: [DatePipe],
  templateUrl: './all-leave-requests.component.html',
  styleUrl: './all-leave-requests.component.css'
})
export class AllLeaveRequestsComponent implements OnInit{
  leaveRequests: LeaveRequest[] = [];
  isProcessing = false;
  currentUserId: string = '';

  constructor(
    private leaveRequestService: AttendanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.leaveRequestService.getAllRequests().subscribe({
      next: (response) => {
        this.leaveRequests = response;
      }
    })
  }

  changeLeaveRequestStatus(requestId: number, newStatus: LeaveStatus) {
    this.isProcessing = true;
    
    this.leaveRequestService.changeLeaveRequestStatus(this.currentUserId, requestId, newStatus).subscribe({
      next: (response) => {
        this.isProcessing = false;
        window.location.reload();
        console.log('Leave request status updated successfully:', response);
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Error updating leave request status:', error);
      }
    });
  }
}
