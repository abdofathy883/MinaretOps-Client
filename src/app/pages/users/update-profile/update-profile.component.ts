import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { ChangePassword, User } from '../../../model/auth/user';

@Component({
  selector: 'app-update-profile',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update-profile.component.html',
  styleUrl: './update-profile.component.css',
})
export class UpdateProfileComponent implements OnInit {
  @Input() currentUser!: User;
  isLoading: boolean = false;
  isPasswordLoading: boolean = false;
  profilePictureFile!: File;

  alertMessage = '';
  alertType = 'info';

  editUserForm!: FormGroup;
  passwordForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.updateFormValues();
  }

  initializeForms(): void {
    this.editUserForm = this.fb.group({
      firstName: ['', [Validators.minLength(3), Validators.maxLength(30)]],
      lastName: ['', [Validators.minLength(3), Validators.maxLength(30)]],
      bio: [''],
      jobTitle: [''],
      profilePicture: [''],
      email: [''],
      phoneNumber: [''],
      paymentNumber: [''],
      city: [''],
      street: [''],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmNewPassword: ['', Validators.required],
      },
      { Validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.profilePictureFile = event.target.files[0];
    }
  }

  updateFormValues(): void {
    if (this.currentUser) {
      this.editUserForm.patchValue({
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email,
        phoneNumber: this.currentUser.phoneNumber,
        paymentNumber: this.currentUser.paymentNumber,
        city: this.currentUser.city,
        street: this.currentUser.street,
        jobTitle: this.currentUser.jobTitle,
        bio: this.currentUser.bio,
      });
    }
  }

  onSubmit(): void {
    if (this.editUserForm.invalid) {
      this.isLoading = false;
      this.editUserForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const updateUser: FormData = new FormData();
    updateUser.append('id', this.currentUser?.id);
    updateUser.append('firstName', this.editUserForm.value.firstName);
    updateUser.append('lastName', this.editUserForm.value.lastName);
    updateUser.append('bio', this.editUserForm.value.bio);
    updateUser.append('jobTitle', this.editUserForm.value.jobTitle);
    updateUser.append('profilePicture', this.profilePictureFile);
    updateUser.append('email', this.editUserForm.value.email);
    updateUser.append('phoneNumber', this.editUserForm.value.phoneNumber);
    updateUser.append('paymentNumber', this.editUserForm.value.paymentNumber);
    updateUser.append('city', this.editUserForm.value.city);
    updateUser.append('street', this.editUserForm.value.street);
    if (!updateUser.get('id')) {
      return;
    }
    this.authService.update(updateUser).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.currentUser = response;
        this.showAlert('تم تحديث بياناتك بنجاح', 'success');
      },
      error: (error) => {
        this.isLoading = false;
        this.showAlert('فشل تحديث البيانات, حاول وقت اخر', 'error');
      },
    });
  }

  updatePassword(): void {
    if (this.passwordForm.invalid || !this.currentUser?.id) return;
    this.isPasswordLoading = true;
    const password: ChangePassword = {
      id: this.currentUser?.id,
      oldPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmNewPassword: this.passwordForm.value.confirmNewPassword,
    };

    this.authService.changePassword(password).subscribe({
      next: (response) => {
        this.isPasswordLoading = false;
        this.currentUser = response;
        this.showAlert('تم تحديث كلمة المرور بنجاح', 'success');
        this.passwordForm.reset();
      },
      error: () => {
        this.isPasswordLoading = false;
        this.showAlert('فشل تحديث كلمة المرور, حاول وقت اخر', 'error');
      },
    });
  }

  // Convenience getters for template
  get passwordControl() {
    return this.passwordForm.get('newPassword');
  }

  get passwordValue(): string {
    return this.passwordControl?.value || '';
  }
  get passHasMin(): boolean {
    return this.passwordValue.length >= 6;
  }

  get passHasUpper(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }

  get passHasLower(): boolean {
    return /[a-z]/.test(this.passwordValue);
  }

  get passHasSpecial(): boolean {
    return /[^A-Za-z0-9]/.test(this.passwordValue);
  }

  requirementClass(ok: boolean): string {
    return ok ? 'text-success' : 'text-danger';
  }

  requirementIcon(ok: boolean): string {
    return ok ? 'bi-check-circle' : 'bi-x-circle';
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
