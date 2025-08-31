import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangePassword, UpdateUser, User } from '../../../model/auth/user';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AttendanceComponent } from "../../attendance/attendance.component";

@Component({
  selector: 'app-my-account',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, AttendanceComponent],
  standalone: true,
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css'
})
export class MyAccountComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  editUserForm!: FormGroup;
  passwordForm!: FormGroup;
  

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute
    ) { 
    this.initializeForms();
    }

  initializeForms(): void {
      this.editUserForm = this.fb.group({
        firstName: ['', [Validators.minLength(3), Validators.maxLength(30)]],
        lastName: ['', [Validators.minLength(3), Validators.maxLength(30)]],
        email: [''],
        phoneNumber: [''],
        paymentNumber: [''],
        city: [''],
        street: [''],
      });

      this.passwordForm = this.fb.group({
        currentPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmNewPassword: ['', Validators.required]
      }, {Validators: this.passwordMatchValidator});
  }
  
  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id') ?? ''
    this.authService.getById(userId).subscribe({
      next: (response) => {
        this.currentUser = response;
        this.updateFormValues();
      }
    })
  }

  updateFormValues(): void {
    if (this.currentUser) {
      this.editUserForm.patchValue({
        firstName: this.currentUser.firstName || '',
        lastName: this.currentUser.lastName || '',
        email: this.currentUser.email || '',
        phoneNumber: this.currentUser.phoneNumber || '',
        paymentNumber: this.currentUser.paymentNumber || '',
        city: this.currentUser.city || '',
        street: this.currentUser.street || '',
      });
    }
  }

  onSubmit(): void {
    debugger;
    if (this.editUserForm.invalid) {
      this.isLoading = false;
      this.editUserForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const updateUser: UpdateUser = {
      id: this.currentUser?.id,
      firstName: this.editUserForm.value.firstName,
      lastName: this.editUserForm.value.lastName,
      email: this.editUserForm.value.email,
      phoneNumber: this.editUserForm.value.phoneNumber,
      paymentNumber: this.editUserForm.value.paymentNumber,
      city: this.editUserForm.value.city,
      street: this.editUserForm.value.street
    }

    if (!updateUser.id) {
      return;
    }
    this.authService.update(updateUser).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.currentUser = response;
        this.successMessage = 'تم تحديث بياناتك بنجاح'
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'فشل تحديث البيانات, حاول وقت اخر'
      }
    })
  }

  updatePassword(): void {
    if (this.passwordForm.invalid || !this.currentUser?.id) return;

    const password: ChangePassword = {
      id: this.currentUser?.id,
      oldPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmNewPassword: this.passwordForm.value.confirmNewPassword
    }


    this.authService.changePassword(password).subscribe({
      next: (response) => {
        this.currentUser = response;

      }
    })
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  logout() {
    this.authService.LogOut();
  }
}
