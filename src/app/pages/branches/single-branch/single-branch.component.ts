import { Component, signal, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BranchService } from '../../../services/branch/branch.service';
import { VaultService } from '../../../services/vault/vault.service';
import { IBranch, IUpdateBranch } from '../../../model/branch/i-branch';
import { IVaultTransaction } from '../../../model/vault-transaction/i-vault-transaction';
import { ShimmerComponent } from '../../../shared/shimmer/shimmer.component';
import { hasError, getErrorMessage } from '../../../services/helper-services/utils';

@Component({
  selector: 'app-single-branch',
  imports: [CommonModule, ReactiveFormsModule, ShimmerComponent],
  templateUrl: './single-branch.component.html',
  styleUrl: './single-branch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleBranchComponent implements OnInit {
  private readonly branchService = inject(BranchService);
  private readonly vaultService = inject(VaultService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  branch = signal<IBranch | null>(null);
  transactions = signal<IVaultTransaction[]>([]);
  isLoading = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  alertMessage = signal<string>('');
  alertType = signal<'info' | 'success' | 'error'>('info');

  updateForm: FormGroup;

  constructor() {
    this.updateForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      code: ['', [Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    this.loadBranch();
  }

  loadBranch(): void {
    const branchIdParam = this.route.snapshot.paramMap.get('id');
    const branchId = Number(branchIdParam);

    if (branchId) {
      this.isLoading.set(true);
      this.branchService.getById(branchId).subscribe({
        next: (response) => {
          this.branch.set(response);
          this.updateForm.patchValue({
            name: response.name,
            code: response.code || ''
          });
          if (response.vault) {
            this.loadTransactions(response.vault.id);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.showAlert('حدث خطأ في تحميل بيانات الفرع', 'error');
        }
      });
    }
  }

  loadTransactions(vaultId: number): void {
    this.vaultService.getVaultTransactions(vaultId).subscribe({
      next: (response) => {
        this.transactions.set(response);
      },
      error: () => {
        this.showAlert('حدث خطأ في تحميل المعاملات', 'error');
      }
    });
  }

  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
  }

  onSubmit(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }

    const branchId = this.branch()?.id;
    if (!branchId) return;

    const formValue = this.updateForm.value;
    const updateData: IUpdateBranch = {
      name: formValue.name,
      code: formValue.code || undefined
    };

    this.isLoading.set(true);
    this.branchService.update(branchId, updateData).subscribe({
      next: (response) => {
        this.branch.set(response);
        this.isEditing.set(false);
        this.isLoading.set(false);
        this.showAlert('تم تحديث الفرع بنجاح', 'success');
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage = error.error?.message || 'حدث خطأ أثناء تحديث الفرع';
        this.showAlert(errorMessage, 'error');
      }
    });
  }

  deleteBranch(): void {
    const branchId = this.branch()?.id;
    if (!branchId) return;

    if (!confirm('هل أنت متأكد من حذف هذا الفرع؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    this.isLoading.set(true);
    this.branchService.delete(branchId).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showAlert('تم حذف الفرع بنجاح', 'success');
        setTimeout(() => {
          this.router.navigate(['/branches']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage = error.error?.message || 'حدث خطأ أثناء حذف الفرع';
        this.showAlert(errorMessage, 'error');
      }
    });
  }

  goToVault(): void {
    const vaultId = this.branch()?.vault?.id;
    if (vaultId) {
      this.router.navigate(['/vaults', vaultId]);
    }
  }

  showAlert(message: string, type: 'info' | 'success' | 'error'): void {
    this.alertMessage.set(message);
    this.alertType.set(type);
    setTimeout(() => {
      this.alertMessage.set('');
    }, 5000);
  }

  goBack(): void {
    this.router.navigate(['/branches']);
  }

  hasError = hasError;
  getErrorMessage = getErrorMessage;
}
