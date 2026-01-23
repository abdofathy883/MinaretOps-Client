import {} from './../../attendance/attendance.component';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UpdateUser, User, UserRoles } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import { AttendanceRecord } from '../../../model/attendance-record/attendance-record';
import { MapUserRolePipe } from '../../../core/pipes/map-user-role/map-user-role.pipe';

@Component({
  selector: 'app-single-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapUserRolePipe],
  templateUrl: './single-user.component.html',
  styleUrl: './single-user.component.css',
})
export class SingleUserComponent implements OnInit, OnDestroy {
  @Input() id!: string;
  user!: User;
  attendanceRecords: AttendanceRecord[] = [];
  isLoading = false;
  isResetPasswordLoading: boolean = false;
  isDeleteUserLoading: boolean = false;
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
    private router: Router,
    private fb: FormBuilder
  ) {
    this.editUserForm = this.fb.group({
      firstName: ['', [Validators.minLength(3), Validators.maxLength(30)]],
      lastName: ['', [Validators.minLength(3), Validators.maxLength(30)]],
      bio: [''],
      jobTitle: [''],
      profilePicture: [''],
      email: ['', [Validators.email]],
      phoneNumber: [''],
      role: [''],
      paymentNumber: [''],
      city: [''],
      street: [''],
      baseSalary: [''],
      employeeType: ['']
    });
  }

  UserRoles = UserRoles;

  get rolesList(): Array<{ key: string; value: string }> {
    return Object.keys(UserRoles)
      .filter((key) => isNaN(Number(key)))
      .filter((key) => key !== 'Finance')
      .map((key) => ({ key, value: key }));
  }

  get hasFinanceRole(): boolean {
    return this.user?.roles?.includes('Finance') || false;
  }

  ngOnInit(): void {
    this.loadUser();
    // this.currentLoggedInUserId = this.authService.getCurrentUserId();
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
    if (!this.id) {
      this.showAlert('معرف المستخدم غير صالح', 'error');
      return;
    }

    this.authService
      .getById(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.populateForm(user);
          this.isLoading = false;
        },
        error: (error) => {
          this.showAlert('حدث خطأ أثناء تحميل بيانات المستخدم', 'error');
          this.isLoading = false;
        },
      });
  }

  populateForm(user: User): void {
    // Get the first non-Finance role as the primary role
    const primaryRole = user.roles.find(r => r !== 'Finance') || user.roles[0];
    
    this.editUserForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: primaryRole, // Show primary role in dropdown
      paymentNumber: user.paymentNumber,
      city: user.city,
      street: user.street,
      baseSalary: user.baseSalary,
      employeeType: user.employeeType
    });
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

    const updateUser: UpdateUser = {
      id: this.user.id,
      firstName: this.editUserForm.value.firstName,
      lastName: this.editUserForm.value.lastName,
      email: this.editUserForm.value.email,
      phoneNumber: this.editUserForm.value.phoneNumber,
      city: this.editUserForm.value.city,
      street: this.editUserForm.value.street,
      paymentNumber: this.editUserForm.value.paymentNumber,
      role: this.editUserForm.value.role,
      baseSalary: this.editUserForm.value.baseSalary,
      employeeType: Number(this.editUserForm.value.employeeType)
    }

    this.authService.update(updateUser).subscribe({
      next: (response) => {
        this.user = response;
        this.isLoading = false;
        this.showAlert('تم تحديث بيانات المستخدم بنجاح', 'success');
      },
      error: (error) => {
        this.isLoading = false;
        this.showAlert('حدث خطأ أثناء تحديث بيانات المستخدم', 'error');
        console.log(error)
      },
    });
  }

  deleteUser() {
    if (this.user?.id == this.currentLoggedInUserId) {
      this.showAlert('لا يمكن حذف حسابك', 'error');
      return;
    }
    this.isDeleteUserLoading = true;
    this.authService.delete(this.user?.id || '').subscribe({
      next: (response) => {
        if (response) {
          this.isDeleteUserLoading = false;
          this.showAlert('تم حذف المستخدم بنجاح', 'success');
          this.router.navigate(['/users']);
        } else {
          this.showAlert('حدث خطأ أثناء حذف المستخدم', 'error');
        }
      },
      error: (error) => {
        this.isDeleteUserLoading = false;
        this.showAlert(error.error, 'error');
      },
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
