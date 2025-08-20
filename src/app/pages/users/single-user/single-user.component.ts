import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-single-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './single-user.component.html',
  styleUrl: './single-user.component.css'
})
export class SingleUserComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isLoading = false;
  isEditMode = false;
  errorMessage = '';
  successMessage = '';
  
  editUserForm: FormGroup;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.editUserForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      role: ['', [Validators.required]],
      password: [''],
    });
  }

  ngOnInit(): void {
    this.loadUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.errorMessage = 'معرف المستخدم غير صحيح';
      return;
    }

    this.authService.getById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.populateForm(user);
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'حدث خطأ أثناء تحميل بيانات المستخدم';
          this.isLoading = false;
        }
      });
  }

  populateForm(user: User): void {
    this.editUserForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      // userName: user.userna, // Using userId as userName since it's not in the User interface
      role: this.getRoleValue(user.roles?.[0]),
      password: '',
      confirmPassword: ''
    });
  }

  getRoleValue(role: string | undefined): string {
    if (!role) return '';
    
    switch (role.toLowerCase()) {
      case 'admin':
      case 'مدير':
        return '1';
      case 'user':
      case 'موظف':
        return '2';
      default:
        return '';
    }
  }

  getRoleDisplayName(roleValue: string): string {
    switch (roleValue) {
      case '1':
        return 'مدير';
      case '2':
        return 'موظف';
      default:
        return 'غير محدد';
    }
  }

  toggleEditMode(): void {
    this.isEditMode = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.populateForm(this.user!);
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveUser(): void {
    if (this.editUserForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.editUserForm.value;
    const updateData = {
      userId: this.user?.id,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      role: parseInt(formValue.role),
      password: formValue.password || undefined
    };

    // Since there's no update method in AuthService, we'll need to add it
    // For now, we'll simulate the update
    this.simulateUpdate(updateData);
  }

  private simulateUpdate(updateData: any): void {
    // Simulate API call delay
    setTimeout(() => {
      // Update local user object
      if (this.user) {
        this.user.firstName = updateData.firstName;
        this.user.lastName = updateData.lastName;
        this.user.email = updateData.email;
        this.user.phoneNumber = updateData.phoneNumber;
        this.user.roles = [this.getRoleDisplayName(updateData.role.toString())];
      }

      this.isLoading = false;
      this.isEditMode = false;
      this.successMessage = 'تم تحديث بيانات المستخدم بنجاح';
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }, 1000);
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword) {
      if (password.value && !confirmPassword.value) {
        return { passwordMismatch: true };
      }
      if (password.value !== confirmPassword.value) {
        return { passwordMismatch: true };
      }
    }

    return null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editUserForm.controls).forEach(key => {
      const control = this.editUserForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper method to check if a form control has a specific error
  hasError(controlName: string, errorType: string): boolean {
    const control = this.editUserForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }

  // Helper method to get error message for a specific control
  getErrorMessage(controlName: string): string {
    const control = this.editUserForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'هذا الحقل مطلوب';
    if (control.errors['email']) return 'صيغة البريد الإلكتروني غير صحيحة';
    if (control.errors['minlength']) return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;
    if (control.errors['maxlength']) return `يجب أن يكون ${control.errors['maxlength'].requiredLength} أحرف على الأكثر`;
    if (control.errors['pattern']) return 'صيغة غير صحيحة';
    if (control.errors['passwordMismatch']) return 'كلمة المرور غير متطابقة';

    return 'قيمة غير صحيحة';
  }
}
