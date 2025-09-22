import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ClientService } from '../../../../services/clients/client.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth/auth.service';
import { ClientStatus, IClient, IUpdateClient } from '../../../../model/client/client';

@Component({
  selector: 'app-client-info',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './client-info.component.html',
  styleUrl: './client-info.component.css',
})
export class ClientInfoComponent implements OnInit, OnChanges {
  @Input() client: IClient | null = null;
  isLoading: boolean = false;
  isEditMode: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  clientForm!: FormGroup;
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;

  constructor(
    private clientService: ClientService, 
    private authService: AuthService,
    private fb: FormBuilder) {}
  ngOnInit(): void {
    this.initializeForm();
    if (this.client) {
      this.populateForm();
    }

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && changes['client'].currentValue && !changes['client'].firstChange) {
      this.populateForm();
    }
  }
  
  private initializeForm(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      personalPhoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      companyName: [''],
      companyNumber: ['', ],
      businessDescription: ['', [Validators.required, Validators.minLength(10)]],
      driveLink: [''],
      discordId: [''],
      status: [0],
      statusNotes: ['']
    });
  }

  getStatusText(status?: ClientStatus): string {
      switch (status) {
        case ClientStatus.Active:
          return 'نشط';
        case ClientStatus.OnHold:
          return 'متوقف مؤقتا';
        case ClientStatus.Cancelled:
          return 'الغى التعاقد';
        default:
          return 'غير معروف';
      }
    }
  
    getStatusClass(status?: ClientStatus): string {
      switch (status) {
        case ClientStatus.Active:
          return 'active';
        case ClientStatus.OnHold:
          return 'onhold';
        case ClientStatus.Cancelled:
          return 'cancelled';
        default:
          return 'unknown';
      }
    }

  private populateForm(): void {
    if (this.client) {

      this.clientForm.patchValue({
        name: this.client.name,
        personalPhoneNumber: this.client.personalPhoneNumber,
        companyName: this.client.companyName || '',
        companyNumber: this.client.companyNumber || '',
        businessDescription: this.client.businessDescription,
        driveLink: this.client.driveLink || '',
        discordId: this.client.discordChannelId || '',
        status: this.client.status,
        statusNotes: this.client.statusNotes
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.isEditMode = false;
    // this.populateForm(this.user!);
    this.errorMessage = '';
    this.successMessage = '';
  }

  hasError(controlName: string): boolean {
    const control = this.clientForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.clientForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'هذا الحقل مطلوب';
    if (control.errors['minlength'])
      return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;

    return 'قيمة غير صحيحة';
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.isLoading = false;
      this.clientForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const formValues = this.clientForm.value;
    const updateClient: IUpdateClient = {
      name: formValues.name,
      personalPhoneNumber: formValues.personalPhoneNumber,
      companyName: formValues.companyName,
      companyNumber: formValues.companyNumber,
      businessDescription: formValues.businessDescription,
      driveLink: formValues.driveLink,
      discordId: formValues.discordId,
      status: formValues.status,
      statusNotes: formValues.statusNotes,
    };

    if (this.client) {
      this.clientService.update(this.client.id, updateClient).subscribe({
        next: (response) => {
          this.successMessage = 'تم تحديث بيانات العميل بنجاح';
          // this.clientUpdated.emit(response);
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'حدث خطأ في تحديث بيانات العميل';
          this.isLoading = false;
        },
      });
    }
  }
}
