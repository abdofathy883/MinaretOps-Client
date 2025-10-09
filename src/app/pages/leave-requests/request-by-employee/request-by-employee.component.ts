import { Component, Input, OnInit } from '@angular/core';
import { LeaveRequest } from '../../../model/attendance-record/attendance-record';
import { LeaveRequestService } from '../../../services/leave-request/leave-request.service';
import { AuthService } from '../../../services/auth/auth.service';
import { DatePipe } from '@angular/common';
import { LeaveStatusPipe } from '../../../core/pipes/leave-request/leave-status.pipe';

@Component({
  selector: 'app-request-by-employee',
  imports: [DatePipe, LeaveStatusPipe],
  templateUrl: './request-by-employee.component.html',
  styleUrl: './request-by-employee.component.css'
})
export class RequestByEmployeeComponent implements OnInit{
  leaves: LeaveRequest[] = [];
  @Input() currentUserId = '';
  constructor(private leaveService: LeaveRequestService, private authService: AuthService) {}

  ngOnInit(): void {
    this.leaveService.getRequestsByEmployeeId(this.currentUserId).subscribe((res) => this.leaves = res);
  }
}
