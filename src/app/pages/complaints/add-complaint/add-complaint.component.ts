import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ComplaintService } from '../../../services/complaints/complaint.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ICreateComplaint } from '../../../model/complaints/i-complaint';
import { AlertService } from '../../../services/helper-services/alert.service';

@Component({
  selector: 'app-add-complaint',
  imports: [ReactiveFormsModule],
  templateUrl: './add-complaint.component.html',
  styleUrl: './add-complaint.component.css',
})
export class AddComplaintComponent implements OnInit {
  complaintFrom!: FormGroup;
  currentUserId: string = '';
  isLoading: boolean = false;
  alertMessage = '';
  alertType = 'info';

  constructor(
    private complaintService: ComplaintService,
    private authService: AuthService,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.complaintFrom = this.fb.group({
      subject: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.complaintFrom.invalid) {
      this.isLoading = false;
      this.complaintFrom.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const complaint: ICreateComplaint = {
      subject: this.complaintFrom.value.subject,
      content: this.complaintFrom.value.content,
      employeeId: this.currentUserId,
    };

    this.complaintService.create(complaint).subscribe({
      next: () => {
        this.isLoading = false;
        this.showAlert('تم اضافة الاعلان بنجاح', 'success');
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('فشل اضافة الاعلان', 'error');
      },
    });
  }

  resetForm() {
    this.complaintFrom.reset();
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
