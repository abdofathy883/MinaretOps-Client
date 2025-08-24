import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RegisterUser } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent implements OnInit, OnDestroy {
  newUser: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  showPassword = false;
  useSameAsPhone = false; // Add this property
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.newUser = this.fb.group({
      firstName: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(30)
      ]],
      lastName: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(30)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      phoneNumber: ['', [
        Validators.required
      ]],
      role: ['', [Validators.required]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6)
      ]],
      city: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      street: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      paymentNumber: ['', Validators.required],
      nid: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      dateOfHiring: ['', Validators.required],
      useSameAsPhone: [false]
    });

    this.newUser.get('useSameAsPhone')?.valueChanges.subscribe(useSame => {
    if (useSame) {
      const phoneValue = this.newUser.get('phoneNumber')?.value;
      this.newUser.get('paymentNumber')?.setValue(phoneValue);
      this.newUser.get('paymentNumber')?.disable({ emitEvent: false });
    } else {
      this.newUser.get('paymentNumber')?.enable({ emitEvent: false });
    }
  });

  // When phone changes and checkbox is ON
  this.newUser.get('phoneNumber')?.valueChanges.subscribe(phoneValue => {
    if (this.newUser.get('useSameAsPhone')?.value) {
      this.newUser.get('paymentNumber')?.setValue(phoneValue);
    }
  });
  }

  ngOnInit(): void {
    // Component initialization logic if needed
    this.resetForm()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.newUser.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;

    // Get the payment number value properly, even if the field is disabled
  let paymentNumberValue = this.newUser.get('paymentNumber')?.value;
  
  // If the field is disabled and useSameAsPhone is checked, get the phone number value
  if (this.newUser.get('paymentNumber')?.disabled && this.newUser.get('useSameAsPhone')?.value) {
    paymentNumberValue = this.newUser.get('phoneNumber')?.value;
  }

    const userData: RegisterUser = {
      firstName: this.newUser.value.firstName,
      lastName: this.newUser.value.lastName,
      email: this.newUser.value.email,
      phoneNumber: this.newUser.value.phoneNumber,
      role: parseInt(this.newUser.value.role),
      password: this.newUser.value.password,
      city: this.newUser.value.city,
      street: this.newUser.value.street,
      nid: this.newUser.value.nid,
      paymentNumber: paymentNumberValue,
      dateOfHiring: this.newUser.value.dateOfHiring
    };

    this.authService.registerUser(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'تم إضافة المستخدم بنجاح!';
          
          // Clear form after successful submission
          this.resetForm();
          
          // Clear success message after 3 seconds and redirect
          setTimeout(() => {
            this.successMessage = '';
            this.router.navigate(['/users']);
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'حدث خطأ أثناء إضافة المستخدم';
          
          // Clear error message after 5 seconds
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
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
    this.useSameAsPhone = false; // Reset the switch
    this.errorMessage = '';
    this.successMessage = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.newUser.controls).forEach(key => {
      const control = this.newUser.get(key);
      control?.markAsTouched();
    });
  }

  // Helper method to check if a form control has a specific error
  hasError(controlName: string, errorType: string): boolean {
    const control = this.newUser.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }

  // Helper method to get error message for a specific control
  getErrorMessage(controlName: string): string {
    const control = this.newUser.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'هذا الحقل مطلوب';
    if (control.errors['email']) return 'صيغة البريد الإلكتروني غير صحيحة';
    if (control.errors['minlength']) return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;
    if (control.errors['maxlength']) return `يجب أن يكون ${control.errors['maxlength'].requiredLength} أحرف على الأكثر`;
    return 'قيمة غير صحيحة';
  }

  // Method to check if form is valid for submit button
  isFormValid(): boolean {
    return this.newUser.valid && !this.isLoading;
  }

  // Method to get role display name
  getRoleDisplayName(roleValue: string): string {
    switch (roleValue) {
      case '1':
        return 'Admin';
      case '2':
        return 'Account Manager';
      case '3':
        return 'Graphic Designer';
      case '4':
        return 'Graphic Designer Team Leader';
      case '5':
        return 'Content Creator';
      case '6':
        return 'Content Creator Team Leader';
      case '7':
        return 'Ads Specialist';
      case '8':
        return 'SEO Specialist';
      case '9':
        return 'Web Developer';
        case '10':
          return 'Video Editor'
      default:
        return 'اختر الدور';
    }
  }

  // Method to handle form field focus
  onFieldFocus(fieldName: string): void {
    // Clear any previous error messages when user starts typing
    const control = this.newUser.get(fieldName);
    if (control && control.touched) {
      control.markAsUntouched();
    }
  }

  // Method to handle form field blur
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
}
