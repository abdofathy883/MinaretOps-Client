import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AnnouncementService } from '../../../services/announcements/announcement.service';
import { CreateAnnouncement } from '../../../model/announcement/announcement';
import { AlertService } from '../../../services/helper-services/alert.service';
import { hasError } from '../../../services/helper-services/utils';

@Component({
  selector: 'app-add-announcement',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-announcement.component.html',
  styleUrl: './add-announcement.component.css',
})
export class AddAnnouncementComponent implements OnInit {
  isLoading: boolean = false;
  announcementForm!: FormGroup;

  alertMessage = '';
  alertType = 'info';

  constructor(
    private announcementService: AnnouncementService,
    private alertService: AlertService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.announcementForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const announcementData: CreateAnnouncement = {
      title: this.announcementForm.value.title,
      message: this.announcementForm.value.message,
    };

    this.announcementService.create(announcementData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showAlert('تم إضافة الإعلان بنجاح', 'success');
        this.announcementForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error && error.error.message) {
          this.showAlert(error.message, 'error');
        } else {
          this.showAlert(
            'فشل في إضافة الإعلان. يرجى المحاولة مرة أخرى.',
            'error'
          );
        }
      },
    });
  }

  resetForm(): void {
    this.announcementForm.reset();
  }

  hasError(fieldName: string): boolean {
    return hasError(this.announcementForm, fieldName);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.announcementForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `يجب أن يكون ${
          fieldName === 'title' ? 'العنوان' : 'المحتوى'
        } ${requiredLength} أحرف على الأقل`;
      }
    }
    return '';
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
