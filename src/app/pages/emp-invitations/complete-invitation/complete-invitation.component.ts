import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICompleteInvitation, IInvitation } from '../../../model/emp-invitation/i-invitation';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpInvitationService } from '../../../services/emp-invitation/emp-invitation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-complete-invitation',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-invitation.component.html',
  styleUrl: './complete-invitation.component.css'
})
export class CompleteInvitationComponent {
  invitationForm: FormGroup;
  invitation?: IInvitation;
  token: string = '';
  isLoading = false;
  alertMessage = '';
  alertType = 'info';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invitationService: EmpInvitationService
  ) {
    this.invitationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      phoneNumber: ['', Validators.required],
      city: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      street: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      nid: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      paymentNumber: ['', Validators.required],
      dateOfHiring: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      jobTitle: [''],
      bio: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.loadInvitation();
      }
    });
  }

  loadInvitation(): void {
    this.invitationService.getInvitationByToken(this.token).subscribe({
      next: (data) => {
        this.invitation = data;
      },
      error: (error) => {
        this.showAlert(error.error?.message || 'الدعوة غير صالحة', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.invitationForm.invalid) {
      this.invitationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const data: ICompleteInvitation = {
      token: this.token,
      firstName: this.invitationForm.value.firstName,
      lastName: this.invitationForm.value.lastName,
      phoneNumber: this.invitationForm.value.phoneNumber,
      city: this.invitationForm.value.city,
      street: this.invitationForm.value.street,
      nid: this.invitationForm.value.nid,
      paymentNumber: this.invitationForm.value.paymentNumber,
      dateOfHiring: this.invitationForm.value.dateOfHiring,
      password: this.invitationForm.value.password,
      jobTitle: this.invitationForm.value.jobTitle,
      bio: this.invitationForm.value.bio
    };

    this.invitationService.completeInvitation(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.showAlert('تم إكمال معلوماتك بنجاح! سيتم مراجعة طلبك من قبل الإدارة.', 'success');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.showAlert(error.error?.message || 'حدث خطأ أثناء إكمال المعلومات', 'error');
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
  }
}
