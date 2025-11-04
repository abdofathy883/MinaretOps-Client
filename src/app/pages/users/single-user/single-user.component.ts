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
import { User, UserRoles } from '../../../model/auth/user';
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
  profilePictureFile!: File;

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
    });
  }

  UserRoles = UserRoles;
  
  // Add this method to get enum keys/values for iteration
  // get rolesList(): Array<{key: string, value: number}> {
  //   return Object.entries(UserRoles)
  //     .filter(([key, value]) => typeof value === 'number')
  //     .map(([key, value]) => ({
  //       key: key,
  //       value: value as number
  //     }));
  // }
  get rolesList(): Array<{ key: string; value: string }> {
  return Object.keys(UserRoles)
    .filter(key => isNaN(Number(key)))
    .map(key => ({ key, value: key }));
}

  

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.profilePictureFile = event.target.files[0];
    }
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
          console.log(user)
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
    this.editUserForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      jobTitle: user.jobTitle,
      bio: user.bio,
      phoneNumber: user.phoneNumber,
      role: user.roles[0],
      paymentNumber: user.paymentNumber,
      city: user.city,
      street: user.street,
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

    const formValue = this.editUserForm.value;

    const updateUser: FormData = new FormData();
    updateUser.append('id', this.user?.id);
    updateUser.append('firstName', formValue.firstName);
    updateUser.append('lastName', formValue.lastName);
    updateUser.append('bio', formValue.bio);
    updateUser.append('jobTitle', formValue.jobTitle);
    updateUser.append('email', formValue.email);
    updateUser.append('phoneNumber', formValue.phoneNumber);
    updateUser.append('city', formValue.city);
    updateUser.append('street', formValue.street);
    updateUser.append('paymentNumber', formValue.paymentNumber);
    // In saveUser() method, around line 182:
    if (this.profilePictureFile) {
      updateUser.append('profilePicture', this.profilePictureFile);
    }
    updateUser.append('role', formValue.role);

    // Convert numeric role value to role name before sending
    // const roleName = this.getRoleNameFromValue(formValue.role);
    // if (roleName) {
    //   updateUser.append('role', roleName);
    // }

    this.authService.update(updateUser).subscribe({
      next: (response) => {
        this.user = response;
        this.isLoading = false;
        this.showAlert('تم تحديث بيانات المستخدم بنجاح', 'success');
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('حدث خطأ أثناء تحديث بيانات المستخدم', 'error');
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
