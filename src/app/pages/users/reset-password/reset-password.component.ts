import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { IResetPassword } from '../../../model/auth/user';
import { AlertService } from '../../../services/helper-services/alert.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading = false;
  alertMessage = '';
  alertType = 'info';
  
  // Extract userId and token from URL parameters
  userId: string = '';
  token: string = '';

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) { 
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Extract userId and token from query parameters
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] || '';
      this.token = params['token'] || '';
      
      if (!this.userId || !this.token) {
        this.showAlert('رابط إعادة تعيين كلمة المرور غير صالح', 'error');
        this.router.navigate(['/login']);
      }
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword) {
      if (newPassword.value !== confirmPassword.value) {
        return { passwordMismatch: true };
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.resetPasswordForm.value;
    
    const resetPasswordData: IResetPassword = {
      userId: this.userId,
      token: this.token,
      newPassword: formValue.newPassword
    };

    this.authService.resetPassword(resetPasswordData).subscribe({
      next: () => {
        this.showAlert('تم إعادة تعيين كلمة المرور بنجاح', 'success');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Reset password error:', error);
        this.showAlert('حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى', 'error');
        this.isLoading = false;
      }
    });
  }

  // Helper method to check if a form control has a specific error
  hasError(controlName: string, errorType: string): boolean {
    const control = this.resetPasswordForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }

  // Helper method to get error message for a specific control
  getErrorMessage(controlName: string): string {
    const control = this.resetPasswordForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'هذا الحقل مطلوب';
    if (control.errors['minlength']) 
      return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;
    
    return 'قيمة غير صحيحة';
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
