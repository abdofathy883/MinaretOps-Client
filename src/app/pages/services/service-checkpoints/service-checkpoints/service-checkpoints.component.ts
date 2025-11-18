import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ICreateServiceCheckpoint,
  IServiceCheckpoint,
} from '../../../../model/checkpoint/i-service-checkpoint';
import { CheckpointService } from '../../../../services/checkpoints/checkpoint.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-service-checkpoints',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './service-checkpoints.component.html',
  styleUrl: './service-checkpoints.component.css',
})
export class ServiceCheckpointsComponent implements OnInit {
  @Input() serviceId: number = 0;
  @Output() checkpointsChanged = new EventEmitter<void>();

  checkpoints: IServiceCheckpoint[] = [];
  loading = false;
  isEditMode = false;
  isUserAdmin = false;
  isUserAccountManager = false;

  // Modal states
  showAddModal = false;
  showEditModal = false;
  selectedCheckpoint: IServiceCheckpoint | null = null;

  checkpointForm: FormGroup;
  alertMessage = '';
  alertType = 'info';

  constructor(
    private checkpointService: CheckpointService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.checkpointForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      ],
      description: ['', [Validators.maxLength(1000)]],
      order: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadUserRoles();
    this.loadCheckpoints();
  }

  loadUserRoles(): void {
    this.authService.isAdmin().subscribe((isAdmin) => {
      this.isUserAdmin = isAdmin;
    });
    this.authService.isAccountManager().subscribe((isAccountManager) => {
      this.isUserAccountManager = isAccountManager;
    });
  }

  canManageCheckpoints(): boolean {
    return this.isUserAdmin || this.isUserAccountManager;
  }

  loadCheckpoints(): void {
    if (!this.serviceId) return;

    this.loading = true;
    this.checkpointService.getServiceCheckpoints(this.serviceId).subscribe({
      next: (checkpoints) => {
        this.checkpoints = checkpoints.sort((a, b) => a.order - b.order);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showAlert('حدث خطأ في تحميل نقاط التحقق', 'error');
      },
    });
  }

  openAddModal(): void {
    this.selectedCheckpoint = null;
    this.checkpointForm.reset({
      name: '',
      description: '',
      order:
        this.checkpoints.length > 0
          ? Math.max(...this.checkpoints.map((c) => c.order)) + 1
          : 1,
    });
    this.showAddModal = true;
  }

  openEditModal(checkpoint: IServiceCheckpoint): void {
    this.selectedCheckpoint = checkpoint;
    this.checkpointForm.patchValue({
      name: checkpoint.name,
      description: checkpoint.description || '',
      order: checkpoint.order,
    });
    this.showEditModal = true;
  }

  closeModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.selectedCheckpoint = null;
    this.checkpointForm.reset();
  }

  saveCheckpoint(): void {
    if (this.checkpointForm.invalid) {
      this.checkpointForm.markAllAsTouched();
      return;
    }

    const formValue = this.checkpointForm.value;

    if (this.selectedCheckpoint) {
      this.updateCheckpoint(formValue);
    } else {
      this.createCheckpoint(formValue);
    }
  }

  createCheckpoint(formValue: any): void {
    const newCheckpoint: ICreateServiceCheckpoint = {
      serviceId: this.serviceId,
      name: formValue.name,
      description: formValue.description || undefined,
      order: formValue.order,
    };

    this.loading = true;
    this.checkpointService.createServiceCheckpoint(newCheckpoint).subscribe({
      next: (response) => {
        this.loading = false;
        this.closeModals();
        this.loadCheckpoints();
        this.showAlert('تم إضافة نقطة التحقق بنجاح', 'success');
        this.checkpointsChanged.emit();
      },
      error: (error) => {
        this.loading = false;
        // Show actual error message
        const errorMessage =
          error?.error?.message ||
          error?.error ||
          error?.message ||
          'حدث خطأ في إضافة نقطة التحقق';
        console.error('Error creating checkpoint:', error);
        this.showAlert(errorMessage, 'error');
      },
    });
  }

  updateCheckpoint(formValue: any): void {
    if (!this.selectedCheckpoint) return;

    this.loading = true;
    this.checkpointService
      .updateServiceCheckpoint(this.selectedCheckpoint.id, {
        name: formValue.name,
        description: formValue.description || undefined,
        order: formValue.order,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.closeModals();
          this.loadCheckpoints();
          this.showAlert('تم تحديث نقطة التحقق بنجاح', 'success');
          this.checkpointsChanged.emit();
        },
        error: () => {
          this.loading = false;
          this.showAlert('حدث خطأ في تحديث نقطة التحقق', 'error');
        },
      });
  }

  deleteCheckpoint(checkpoint: IServiceCheckpoint): void {
    if (!confirm(`هل أنت متأكد من حذف نقطة التحقق "${checkpoint.name}"؟`)) {
      return;
    }

    this.loading = true;
    this.checkpointService.deleteServiceCheckpoint(checkpoint.id).subscribe({
      next: () => {
        this.loading = false;
        this.loadCheckpoints();
        this.showAlert('تم حذف نقطة التحقق بنجاح', 'success');
        this.checkpointsChanged.emit();
      },
      error: () => {
        this.loading = false;
        this.showAlert('حدث خطأ في حذف نقطة التحقق', 'error');
      },
    });
  }

  hasError(controlName: string): boolean {
    const control = this.checkpointForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.checkpointForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'هذا الحقل مطلوب';
    if (control.errors['minlength']) {
      return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;
    }
    if (control.errors['maxlength']) {
      return `يجب أن يكون ${control.errors['maxlength'].requiredLength} أحرف على الأكثر`;
    }
    if (control.errors['min']) {
      return `يجب أن تكون القيمة ${control.errors['min'].min} على الأقل`;
    }

    return 'قيمة غير صحيحة';
  }

  showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.closeAlert();
    }, 5000);
  }

  closeAlert(): void {
    this.alertMessage = '';
  }
}
