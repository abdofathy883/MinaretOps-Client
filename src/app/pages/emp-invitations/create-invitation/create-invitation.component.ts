import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRoles } from '../../../model/auth/user';
import { EmpInvitationService } from '../../../services/emp-invitation/emp-invitation.service';
import { ICreateInvitation } from '../../../model/emp-invitation/i-invitation';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-invitation',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-invitation.component.html',
  styleUrl: './create-invitation.component.css'
})
export class CreateInvitationComponent {
  invitationForm: FormGroup;
  isLoading = false;
  alertMessage = '';
  alertType = 'info';

  constructor(
    private fb: FormBuilder,
    private invitationService: EmpInvitationService
  ) {
    this.invitationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.invitationForm.invalid) {
      this.invitationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const data: ICreateInvitation = {
      email: this.invitationForm.value.email,
      role: Number(this.invitationForm.value.role)
    };

    this.invitationService.createInvitation(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.showAlert('تم إرسال الدعوة بنجاح!', 'success');
        this.invitationForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        console.log(error)
        this.showAlert(error.error?.message || 'حدث خطأ أثناء إرسال الدعوة', 'error');
      }
    });
  }

  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }
}
