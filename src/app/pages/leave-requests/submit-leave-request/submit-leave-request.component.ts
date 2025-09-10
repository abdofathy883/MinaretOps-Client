import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../../model/auth/user';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AttendanceService } from '../../../services/attendance/attendance.service';
import { NewLeaveRequest } from '../../../model/attendance-record/attendance-record';

@Component({
  selector: 'app-submit-leave-request',
  imports: [ReactiveFormsModule],
  templateUrl: './submit-leave-request.component.html',
  styleUrl: './submit-leave-request.component.css',
})
export class SubmitLeaveRequestComponent implements OnInit {
  @Input() currentUser!: User;
  today: string = new Date().toISOString().split('T')[0];
  leaveRequestForm!: FormGroup;
  isLoading: boolean = false;
  showSuccessMessage: boolean = false;

  constructor(
    private leaveRequestService: AttendanceService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.leaveRequestForm = this.fb.group({
      employeeId: [''],
      fromDate: ['', Validators.required, Validators],
      toDate: ['', Validators.required, Validators],
    });
  }

  onSubmit() {
    if (this.leaveRequestForm.invalid) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    const formData : NewLeaveRequest = {
      employeeId: this.currentUser.id,
      fromDate: this.leaveRequestForm.value.fromDate,
      toDate: this.leaveRequestForm.value.toDate
    }
    console.log('Submitting leave request:', formData);
    this.leaveRequestService.newLeaveRequest(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Leave request submitted successfully:', response);
        alert('تم تقديم طلب الإجازة بنجاح.');
        this.leaveRequestForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error submitting leave request:', error);
        alert('حدث خطأ أثناء تقديم طلب الإجازة. الرجاء المحاولة مرة أخرى.');
      },
    });
  }
}
