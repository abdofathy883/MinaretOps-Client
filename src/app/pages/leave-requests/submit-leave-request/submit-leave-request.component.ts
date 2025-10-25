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
import { hasError } from '../../../services/helper-services/utils';

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

  proofFile!: File;

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
      type: ['0', Validators.required],
      proofFile: [''],
      reason: ['', [Validators.required, Validators.maxLength(3000)]]
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.proofFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.leaveRequestForm.invalid) {
      this.leaveRequestForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    const formData: FormData = new FormData();
    formData.append('employeeId', this.currentUser.id);
    formData.append('fromDate', this.leaveRequestForm.value.fromDate);
    formData.append('toDate', this.leaveRequestForm.value.toDate);
    formData.append('type', this.leaveRequestForm.value.type);
    formData.append('reason', this.leaveRequestForm.value.reason);
    formData.append('proofFile', this.proofFile);

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

  hasError(controlName: string): boolean {
      return hasError(this.leaveRequestForm, controlName);
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
