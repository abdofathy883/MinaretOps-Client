import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ClientService } from '../../../../services/clients/client.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth/auth.service';
import {
  BusinessType,
  ClientStatus,
  IClient,
  IUpdateClient,
} from '../../../../model/client/client';
import { hasError } from '../../../../services/helper-services/utils';
import { User } from '../../../../model/auth/user';
import { COUNTRIES } from '../../../../core/assets/countries';

@Component({
  selector: 'app-client-info',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './client-info.component.html',
  styleUrl: './client-info.component.css',
})
export class ClientInfoComponent implements OnInit, OnChanges {
  @Input() client: IClient | null = null;
  employees: User[] = [];
  isLoading: boolean = false;
  isDeleteLoading: boolean = false;
  isEditMode: boolean = false;
  clientForm!: FormGroup;
  isUserAdmin: boolean = false;
  isUserAccountManager: boolean = false;
  alertMessage = '';
  alertType = 'info';

  countries = COUNTRIES;

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.client) {
      this.populateForm();
    }

    this.authService
      .getAll()
      .subscribe((response) => (this.employees = response));

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

  get isCommercial(): boolean {
      return (
        Number(this.clientForm.get('businessType')?.value) ===
        BusinessType.Commercial
      );
    }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['client'] &&
      changes['client'].currentValue &&
      !changes['client'].firstChange
    ) {
      this.populateForm();
    }
  }

  private initializeForm(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      personalPhoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)],
      ],
      companyName: [''],
      companyNumber: [''],
      email: [''],
      businessDescription: [
        '',
        [Validators.required, Validators.minLength(10)],
      ],
      driveLink: [''],
      businessType: [0, Validators.required],
      businessActivity: [''],
      commercialRegisterNumber: [''],
      taxCardNumber: [''],
      accountManagerId: [''],
      country: [''],
      discordChannelId: [''],
      status: [0],
      statusNotes: [''],
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
        companyName: this.client.companyName,
        companyNumber: this.client.companyNumber,
        email: this.client.email,
        businessDescription: this.client.businessDescription,
        driveLink: this.client.driveLink,
        discordChannelId: this.client.discordChannelId,
        businessType: this.client.businessType,
        businessActivity: this.client.businessActivity,
        commercialRegisterNumber: this.client.commercialRegisterNumber,
        taxCardNumber: this.client.taxCardNumber,
        accountManagerId: this.client.accountManagerId,
        country: this.client.country,
        status: this.client.status,
        statusNotes: this.client.statusNotes,
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = true;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    // this.populateForm(this.user!);
  }

  hasError(controlName: string): boolean {
    return hasError(this.clientForm, controlName);
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

    const formValues = this.clientForm.value;
    const updateClient: IUpdateClient = {
      name: formValues.name,
      personalPhoneNumber: formValues.personalPhoneNumber,
      companyName: formValues.companyName,
      companyNumber: formValues.companyNumber,
      email: formValues.email,
      businessDescription: formValues.businessDescription,
      driveLink: formValues.driveLink,
      businessType: parseInt(formValues.businessType),
      businessActivity: formValues.businessActivity,
      commercialRegisterNumber: formValues.commercialRegisterNumber,
      taxCardNumber: formValues.taxCardNumber,
      country: formValues.country,
      accountManagerId: formValues.accountManagerId,
      discordChannelId: formValues.discordChannelId,
      status: parseInt(formValues.status),
      statusNotes: formValues.statusNotes,
    };

    if (this.client) {
      this.clientService.update(this.client.id, updateClient).subscribe({
        next: (response) => {
          this.showAlert('تم تحديث بيانات العميل بنجاح', 'success');
          this.client = response;

          // this.clientUpdated.emit(response);
          this.isLoading = false;
        },
        error: () => {
          this.showAlert('فشل في تحديث بيانات العميل, حاول مرة اخرى', 'error');
          this.isLoading = false;
        },
      });
    }
  }

  deleteClient(): void {
    this.isDeleteLoading = true;
    this.clientService.delete(this.client!.id).subscribe({
      next: (response) => {
        this.isDeleteLoading = false;
        this.showAlert('تم حذف العميل بنجاح', 'success');
      },
      error: (error) => {
        this.isDeleteLoading = false;
        this.showAlert('فشل في حذف العميل, حاول مرة اخرى', 'error');
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
