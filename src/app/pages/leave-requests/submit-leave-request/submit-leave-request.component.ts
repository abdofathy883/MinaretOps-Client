import { AlertService } from './../../../services/helper-services/alert.service';
import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../../model/auth/user';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NewLeaveRequest } from '../../../model/attendance-record/attendance-record';
import { LeaveRequestService } from '../../../services/leave-request/leave-request.service';

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
  alertMessage = '';
  alertType = 'info';

  constructor(
    private leaveRequestService: LeaveRequestService,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.leaveRequestForm = this.fb.group({
      employeeId: [''],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.leaveRequestForm.invalid) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    const formData: NewLeaveRequest = {
      employeeId: this.currentUser.id,
      fromDate: this.leaveRequestForm.value.fromDate,
      toDate: this.leaveRequestForm.value.toDate,
    };
    this.leaveRequestService.newLeaveRequest(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showAlert('تم تقديم طلب الإجازة بنجاح', 'success');
        this.leaveRequestForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.showAlert('حدث خطأ أثناء تقديم طلب الإجازة', 'error');
      },
    });
  }

  showAlert(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;

    setTimeout(() => {
      this.closeAlert();
    }, 5000);
  }

  closeAlert() {
    this.alertMessage = '';
  }
}
