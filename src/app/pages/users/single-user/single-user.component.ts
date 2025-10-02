import { AttendanceComponent } from './../../attendance/attendance.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UpdateUser, User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import { AttendanceService } from '../../../services/attendance/attendance.service';
import { AttendanceRecord } from '../../../model/attendance-record/attendance-record';
import { MyKpisManagementComponent } from '../../kpis/my-kpis-management/my-kpis-management.component';
import { AlertService } from '../../../services/helper-services/alert.service';

@Component({
  selector: 'app-single-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MyKpisManagementComponent],
  templateUrl: './single-user.component.html',
  styleUrl: './single-user.component.css',
})
export class SingleUserComponent implements OnInit, OnDestroy {
  user!: User;
  attendanceRecords: AttendanceRecord[] = [];
  isLoading = false;
  isResetPasswordLoading: boolean = false;
  isEditMode = false;
  currentLoggedInUserId: string = '';
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;

  alertMessage = '';
  alertType = 'info';

  editUserForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private attendanceService: AttendanceService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.editUserForm = this.fb.group({
      firstName: ['', [Validators.minLength(3), Validators.maxLength(30)]],
      lastName: ['', [Validators.minLength(3), Validators.maxLength(30)]],
      bio: ['', Validators.required],
      jobTitle: ['', Validators.required],
      profilePicture: ['', Validators.required],
      email: ['', [Validators.email]],
      phoneNumber: [''],
      role: [''],
      paymentNumber: [''],
      city: [''],
      street: [''],
    });
  }

  loadAttendance(empId: string) {
    this.attendanceService.getAttendanceByEmployeeId(empId).subscribe({
      next: (response) => {
        this.attendanceRecords = response;
      },
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
      this.showAlert('معرف المستخدم غير صالح', 'error');
      return;
    }

    this.authService
      .getById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.populateForm(user);
          this.isLoading = false;
          this.loadAttendance(userId);
        },
        error: (error) => {
          this.showAlert(
            'حدث خطأ أثناء تحميل بيانات المستخدم',
            'error'
          );
          this.isLoading = false;
        },
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
      street: user.street,
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
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.populateForm(this.user!);
  }

  saveUser(): void {
    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formValue = this.editUserForm.value;

    const updateUser: FormData = new FormData();
    updateUser.append('id', this.user?.id);
    updateUser.append('firstName', formValue.firstName);
    updateUser.append('lastName', formValue.lastName);
    updateUser.append('bio', formValue.bio);
    updateUser.append('jobTitle', formValue.jobTitle);
    // updateUser.append('profilePicture', this.profilePictureFile);
    updateUser.append('email', formValue.email);
    updateUser.append('phoneNumber', formValue.phoneNumber);
    updateUser.append('city', formValue.city);
    updateUser.append('street', formValue.street);
    updateUser.append('paymentNumber', formValue.paymentNumber);

    this.authService.update(updateUser).subscribe({
      next: (response) => {
        this.user = response;
        this.showAlert(
          'تم تحديث بيانات المستخدم بنجاح',
          'success'
        );
      },
      error: () => {
        this.showAlert(
          'حدث خطأ أثناء تحديث بيانات المستخدم',
          'error'
        );
      },
    });
  }

  deleteUser() {
    if (this.user?.id == this.currentLoggedInUserId) {
      this.showAlert('لا يمكن حذف حسابك', 'error');
      return;
    }
    this.authService.delete(this.user?.id || '').subscribe({
      next: (response) => {
        if (response) {
          this.showAlert('تم حذف المستخدم بنجاح', 'success');
          this.router.navigate(['/users']);
        } else {
          this.showAlert('حدث خطأ أثناء حذف المستخدم', 'error');
        }
      },
      error: (error) => {
        this.showAlert('حدث خطأ أثناء حذف المستخدم', 'error');
      },
    });
  }

  private passwordMatchValidator(
    form: FormGroup
  ): { [key: string]: any } | null {
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
    if (control.errors['minlength'])
      return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;
    if (control.errors['maxlength'])
      return `يجب أن يكون ${control.errors['maxlength'].requiredLength} أحرف على الأكثر`;
    if (control.errors['pattern']) return 'صيغة غير صحيحة';
    if (control.errors['passwordMismatch']) return 'كلمة المرور غير متطابقة';

    return 'قيمة غير صحيحة';
  }

  requestPasswordReset(): void {
    this.isResetPasswordLoading = true;
    this.authService.requestPasswordReset(this.user.id).subscribe({
      next: () => {
        this.isResetPasswordLoading = false;
        this.showAlert(
          'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريد المستخدم.',
          'success'
        );
      },
      error: (err) => {
        this.isResetPasswordLoading = false;
        this.showAlert(
          'حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور.',
          'error'
        );
      },
    });
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
