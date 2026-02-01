import { Component, signal, OnInit, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VaultService } from '../../../services/vault/vault.service';
import { IVault } from '../../../model/vault/i-vault';
import { IVaultTransaction, ICreateVaultTransaction, IVaultTransactionFilter, TransactionType, TransactionReferenceType } from '../../../model/vault-transaction/i-vault-transaction';
import { ShimmerComponent } from '../../../shared/shimmer/shimmer.component';
import { hasError, getErrorMessage } from '../../../services/helper-services/utils';

@Component({
  selector: 'app-single-vault',
  imports: [CommonModule, ReactiveFormsModule, ShimmerComponent],
  templateUrl: './single-vault.component.html',
  styleUrl: './single-vault.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleVaultComponent implements OnInit {
  private readonly vaultService = inject(VaultService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  vault = signal<IVault | null>(null);
  transactions = signal<IVaultTransaction[]>([]);
  isLoading = signal<boolean>(false);
  showAddTransactionForm = signal<boolean>(false);
  alertMessage = signal<string>('');
  alertType = signal<'info' | 'success' | 'error'>('info');

  transactionForm: FormGroup;
  filterForm: FormGroup;

  filteredTransactions = computed(() => {
    const allTransactions = this.transactions();
    const filter = this.filterForm.value;
    
    let filtered = [...allTransactions];
    
    if (filter.transactionType !== null && filter.transactionType !== '') {
      filtered = filtered.filter(t => t.transactionType === Number(filter.transactionType));
    }
    
    if (filter.fromDate) {
      filtered = filtered.filter(t => new Date(t.transactionDate) >= new Date(filter.fromDate));
    }
    
    if (filter.toDate) {
      filtered = filtered.filter(t => new Date(t.transactionDate) <= new Date(filter.toDate));
    }
    
    return filtered;
  });

  constructor() {
    this.transactionForm = this.fb.group({
      transactionType: [TransactionType.Incoming, Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      transactionDate: [new Date().toISOString().split('T')[0], Validators.required],
      description: [''],
      referenceType: [TransactionReferenceType.Manual, Validators.required],
      referenceId: [''],
      notes: ['']
    });

    this.filterForm = this.fb.group({
      transactionType: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadVault();
  }

  loadVault(): void {
    const vaultIdParam = this.route.snapshot.paramMap.get('id');
    const vaultId = Number(vaultIdParam);

    if (vaultId) {
      this.isLoading.set(true);
      this.vaultService.getById(vaultId).subscribe({
        next: (response) => {
          this.vault.set(response);
          this.loadTransactions(vaultId);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.showAlert('حدث خطأ في تحميل بيانات الخزنة', 'error');
        }
      });
    }
  }

  loadTransactions(vaultId: number, filter?: IVaultTransactionFilter): void {
    this.vaultService.getVaultTransactions(vaultId, filter).subscribe({
      next: (response) => {
        this.transactions.set(response);
      },
      error: () => {
        this.showAlert('حدث خطأ في تحميل المعاملات', 'error');
      }
    });
  }

  toggleAddTransactionForm(): void {
    this.showAddTransactionForm.set(!this.showAddTransactionForm());
    if (!this.showAddTransactionForm()) {
      this.transactionForm.reset({
        transactionType: TransactionType.Incoming,
        transactionDate: new Date().toISOString().split('T')[0],
        referenceType: TransactionReferenceType.Manual
      });
    }
  }

  onSubmitTransaction(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const vaultId = this.vault()?.id;
    if (!vaultId) return;

    const formValue = this.transactionForm.value;
    const transactionData: ICreateVaultTransaction = {
      vaultId: vaultId,
      transactionType: TransactionType.Incoming,
      amount: Number(formValue.amount),
      transactionDate: formValue.transactionDate,
      description: formValue.description || undefined,
      referenceType: Number(formValue.referenceType),
      referenceId: formValue.referenceId ? Number(formValue.referenceId) : undefined,
      notes: formValue.notes || undefined
    };

    this.isLoading.set(true);
    this.vaultService.createTransaction(transactionData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showAlert('تم إضافة المعاملة بنجاح', 'success');
        this.toggleAddTransactionForm();
        this.loadTransactions(vaultId);
        this.loadVault(); // Refresh balance
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage = error.error?.message || 'حدث خطأ أثناء إضافة المعاملة';
        this.showAlert(errorMessage, 'error');
      }
    });
  }

  applyFilters(): void {
    const vaultId = this.vault()?.id;
    if (!vaultId) return;

    const filter: IVaultTransactionFilter = {
      transactionType: this.filterForm.value.transactionType ? Number(this.filterForm.value.transactionType) : undefined,
      fromDate: this.filterForm.value.fromDate || undefined,
      toDate: this.filterForm.value.toDate || undefined
    };

    this.loadTransactions(vaultId, filter);
  }

  clearFilters(): void {
    this.filterForm.reset({
      transactionType: '',
      fromDate: '',
      toDate: ''
    });
    const vaultId = this.vault()?.id;
    if (vaultId) {
      this.loadTransactions(vaultId);
    }
  }

  deleteTransaction(id: number): void {
    if (!confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
      return;
    }

    this.isLoading.set(true);
    this.vaultService.deleteTransaction(id).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showAlert('تم حذف المعاملة بنجاح', 'success');
        const vaultId = this.vault()?.id;
        if (vaultId) {
          this.loadTransactions(vaultId);
          this.loadVault(); // Refresh balance
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMessage = error.error?.message || 'حدث خطأ أثناء حذف المعاملة';
        this.showAlert(errorMessage, 'error');
      }
    });
  }

  showAlert(message: string, type: 'info' | 'success' | 'error'): void {
    this.alertMessage.set(message);
    this.alertType.set(type);
    setTimeout(() => {
      this.alertMessage.set('');
    }, 5000);
  }

  goBack(): void {
    this.router.navigate(['/vaults']);
  }

  goToBranch(): void {
    const branchId = this.vault()?.branchId;
    if (branchId) {
      this.router.navigate(['/branches', branchId]);
    }
  }

  hasError = hasError;
  getErrorMessage = getErrorMessage;

  get TransactionType() {
    return TransactionType;
  }

  get TransactionReferenceType() {
    return TransactionReferenceType;
  }
}
