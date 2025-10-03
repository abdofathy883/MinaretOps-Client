import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangePassword, UpdateUser, User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AttendanceComponent } from '../../attendance/attendance.component';
import { SubmitLeaveRequestComponent } from '../../leave-requests/submit-leave-request/submit-leave-request.component';
import { MyKpisManagementComponent } from '../../kpis/my-kpis-management/my-kpis-management.component';
import { AlertService } from '../../../services/helper-services/alert.service';
import { ShimmerComponent } from "../../../shared/shimmer/shimmer.component";
@Component({
  selector: 'app-my-account',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    AttendanceComponent,
    SubmitLeaveRequestComponent,
    MyKpisManagementComponent,
    ShimmerComponent
],
  standalone: true,
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css',
})
export class MyAccountComponent implements OnInit {
  currentUser!: User;
  isLoading: boolean = false;
  loadingUser: boolean = false;
  isPasswordLoading: boolean = false;
  profilePictureFile!: File;

  alertMessage = '';
  alertType = 'info';

  editUserForm!: FormGroup;
  passwordForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.initializeForms();
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

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.profilePictureFile = event.target.files[0];
    }
  }

  ngOnInit(): void {
    this.loadingUser = true;
    const userId = this.route.snapshot.paramMap.get('id') ?? '';
    this.authService.getById(userId).subscribe({
      next: (response) => {
        this.currentUser = response;
        this.loadingUser = false;
        this.updateFormValues();
      },
    });
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
        bio: this.currentUser.bio
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
        this.showAlert(
          'فشل تحديث البيانات, حاول وقت اخر',
          'error'
        );
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
        this.showAlert(
          'فشل تحديث كلمة المرور, حاول وقت اخر',
          'error'
        );
      },
    });
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

  logout() {
    this.authService.LogOut();
  }

  private passwordComplexityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value || '';
      if (!value) return null; // handled by required

      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasSpecial = /[^A-Za-z0-9]/.test(value);

      return hasUpper && hasLower && hasSpecial
        ? null
        : { passwordComplexity: true };
    };
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
