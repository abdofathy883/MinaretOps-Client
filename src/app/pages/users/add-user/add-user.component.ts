import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { hasError } from '../../../services/helper-services/utils';
import { RegisterUser } from '../../../model/auth/user';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css',
})
export class AddUserComponent implements OnInit {
  newUser: FormGroup;
  isLoading = false;
  showPassword = false;
  useSameAsPhone = false;
  profilePictureFile!: File;

  alertMessage = '';
  alertType = 'info';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.newUser = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      role: ['choose', [Validators.required]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          this.passwordComplexityValidator(),
        ],
      ],
      city: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ],
      ],
      street: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      ],
      paymentNumber: ['', Validators.required],
      nid: [
        '',
        [
          Validators.required,
          Validators.minLength(14),
          Validators.maxLength(14),
        ],
      ],
      dateOfHiring: ['', Validators.required],
      useSameAsPhone: [false],
    });

    this.newUser.get('useSameAsPhone')?.valueChanges.subscribe((useSame) => {
      if (useSame) {
        const phoneValue = this.newUser.get('phoneNumber')?.value;
        this.newUser.get('paymentNumber')?.setValue(phoneValue);
        this.newUser.get('paymentNumber')?.disable({ emitEvent: false });
      } else {
        this.newUser.get('paymentNumber')?.enable({ emitEvent: false });
      }
    });

    // When phone changes and checkbox is ON
    this.newUser.get('phoneNumber')?.valueChanges.subscribe((phoneValue) => {
      if (this.newUser.get('useSameAsPhone')?.value) {
        this.newUser.get('paymentNumber')?.setValue(phoneValue);
      }
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.profilePictureFile = event.target.files[0];
    }
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
    return this.newUser.get('password');
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

  ngOnInit(): void {
    this.resetForm();
  }

  onSubmit(): void {
    if (this.newUser.invalid) {
      this.newUser.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    let paymentNumberValue = this.newUser.get('paymentNumber')?.value;
    if (
      this.newUser.get('paymentNumber')?.disabled &&
      this.newUser.get('useSameAsPhone')?.value
    ) {
      paymentNumberValue = this.newUser.get('phoneNumber')?.value;
    }

    const userData: RegisterUser = {
      firstName: this.newUser.value.firstName,
      lastName: this.newUser.value.lastName,
      // jobTitle: this.newUser.value.jobTitle,
      // bio: this.newUser.value.bio,
      // profilePicture: this.profilePictureFile,
      email: this.newUser.value.email,
      phoneNumber: this.newUser.value.phoneNumber,
      role: parseInt(this.newUser.value.role),
      password: this.newUser.value.password,
      city: this.newUser.value.city,
      street: this.newUser.value.street,
      nid: this.newUser.value.nid,
      paymentNumber: paymentNumberValue,
      dateOfHiring: this.newUser.value.dateOfHiring,
    };
    this.authService.registerUser(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showAlert('تم إضافة المستخدم بنجاح!', 'success');
      },
      error: (error) => {
        this.isLoading = false;
        this.showAlert('حدث خطأ أثناء إضافة المستخدم', 'error');
      },
    });
  }

  onPaymentSwitchChange(): void {
    if (this.useSameAsPhone) {
      const phoneValue = this.newUser.get('phoneNumber')?.value;
      this.newUser.patchValue({ paymentNumber: phoneValue });
      this.newUser.get('paymentNumber')?.disable({ emitEvent: false });
    } else {
      this.newUser.get('paymentNumber')?.enable({ emitEvent: false });
    }
  }

  resetForm(): void {
    this.newUser.reset();
    this.showPassword = false;
    this.useSameAsPhone = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  hasError(controlName: string, errorType: string): boolean {
    return hasError(this.newUser, controlName);
  }

  getErrorMessage(controlName: string): string {
    const control = this.newUser.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'هذا الحقل مطلوب';
    if (control.errors['email']) return 'صيغة البريد الإلكتروني غير صحيحة';
    if (control.errors['minlength'])
      return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;
    if (control.errors['maxlength'])
      return `يجب أن يكون ${control.errors['maxlength'].requiredLength} أحرف على الأكثر`;
    return 'قيمة غير صحيحة';
  }

  isFormValid(): boolean {
    return this.newUser.valid && !this.isLoading;
  }

  onFieldFocus(fieldName: string): void {
    // Clear any previous error messages when user starts typing
    const control = this.newUser.get(fieldName);
    if (control && control.touched) {
      control.markAsUntouched();
    }
  }

  onFieldBlur(fieldName: string): void {
    const control = this.newUser.get(fieldName);
    if (control) {
      control.markAsTouched();
    }
  }

  // Method to check if a specific field is invalid and touched
  isFieldInvalid(fieldName: string): boolean {
    const control = this.newUser.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }

  // Method to get field validation classes
  getFieldValidationClasses(fieldName: string): string {
    const control = this.newUser.get(fieldName);
    if (!control) return 'form-control';

    if (control.invalid && control.touched) {
      return 'form-control is-invalid';
    } else if (control.valid && control.touched) {
      return 'form-control is-valid';
    }

    return 'form-control';
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
