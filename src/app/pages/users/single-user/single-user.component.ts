import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UpdateUser, User } from '../../../model/auth/user';
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
  currentLoggedInUserId: string = '';
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;
  
  editUserForm: FormGroup;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.editUserForm = this.fb.group({
      firstName: ['', [Validators.minLength(3), Validators.maxLength(30)]],
      lastName: ['', [Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.email]],
      phoneNumber: [''],
      role: [''],
      paymentNumber: [''],
      city: [''],
      street: ['']
    });
  }

  ngOnInit(): void {
    this.loadUser();
    this.currentLoggedInUserId = this.authService.getCurrentUserId();
    this.authService.isAdmin().subscribe((isAdmin) => {
      if (isAdmin) {
        this.isUserAdmin = true;
      }
    });
    this.authService.isAccountManager().subscribe((isAccountManager) => {
      if (isAccountManager) {
        this.isUserAccountManager = true;
      }
    });
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
      role: this.getRoleValue(user.roles?.[0]),
      paymentNumber: user.paymentNumber,
      city: user.city,
      street: user.street
    });
  }

  getRoleValue(role: string | undefined): string {
    if (!role) return '';
    
    switch (role.toLowerCase()) {
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
          return 'Video Editor';
      default:
        return 'اختر الدور';
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

    const updateUser: UpdateUser = {
      id: this.user?.id,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      city: formValue.city,
      street: formValue.street,
      paymentNumber: formValue.paymentNumber
    };

    this.authService.update(updateUser).subscribe({
      next: (response) => {
        this.user = response;
        this.successMessage = 'تم تحديث بيانات المستخدم بنجاح';
      },
      error: (error) => {
        console.log(error);
        this.errorMessage = 'حدث خطأ أثناء تحديث بيانات المستخدم';
      }
    })


  }

  deleteUser() {
    if (this.user?.id == this.currentLoggedInUserId) {
      this.errorMessage = "لا يمكن حذف حسابك";
      return;
    }
    this.authService.delete(this.user?.id || '').subscribe({
      next: (response) => {
        if (response) {
          this.successMessage = 'تم حذف المستخدم بنجاح';
          this.router.navigate(['/users']);
        } else {
          this.errorMessage = 'حدث خطأ أثناء حذف المستخدم';
        }
      },
      error: (error) => {
        console.log(error);
        this.errorMessage = 'حدث خطأ أثناء حذف المستخدم';
      }
    });
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
