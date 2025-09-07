import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AnnouncementService } from '../../../services/announcements/announcement.service';
import { CreateAnnouncement } from '../../../model/announcement/announcement';

@Component({
  selector: 'app-add-announcement',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-announcement.component.html',
  styleUrl: './add-announcement.component.css'
})
export class AddAnnouncementComponent implements OnInit {
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  announcementForm!: FormGroup;

  constructor(
    private announcementService: AnnouncementService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.announcementForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const announcementData: CreateAnnouncement = {
      title: this.announcementForm.value.title,
      message: this.announcementForm.value.message
    };

    this.announcementService.create(announcementData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'تم إضافة الإعلان بنجاح';
        this.announcementForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'فشل في إضافة الإعلان. يرجى المحاولة مرة أخرى.';
        }
      }
    });
  }

  resetForm(): void {
    this.announcementForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  hasError(fieldName: string): boolean {
    const field = this.announcementForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.announcementForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `يجب أن يكون ${fieldName === 'title' ? 'العنوان' : 'المحتوى'} ${requiredLength} أحرف على الأقل`;
      }
    }
    return '';
  }
}
