import { Component, signal, OnInit, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VaultService } from '../../../services/vault/vault.service';
import { CurrencyService } from '../../../services/currency/currency.service';
import { IVault } from '../../../model/vault/i-vault';
import { ICurrency } from '../../../model/currency/i-currency';
import { IVaultTransaction, IVaultTransactionFilter, TransactionType, TransactionReferenceType } from '../../../model/vault-transaction/i-vault-transaction';
import { ShimmerComponent } from '../../../shared/shimmer/shimmer.component';

@Component({
  selector: 'app-unified-vault',
  imports: [CommonModule, ReactiveFormsModule, ShimmerComponent],
  templateUrl: './unified-vault.component.html',
  styleUrl: './unified-vault.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnifiedVaultComponent implements OnInit {
  private readonly vaultService = inject(VaultService);
  private readonly currencyService = inject(CurrencyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  vault = signal<IVault | null>(null);
  transactions = signal<IVaultTransaction[]>([]);
  currencies = signal<ICurrency[]>([]);
  isLoading = signal<boolean>(false);

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
    this.filterForm = this.fb.group({
      transactionType: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadCurrencies();
    this.loadUnifiedVault();
  }

  loadCurrencies(): void {
    this.currencyService.getAll().subscribe({
      next: (response) => {
        this.currencies.set(response);
      }
    });
  }

  loadUnifiedVault(): void {
    const currencyIdParam = this.route.snapshot.paramMap.get('currencyId');
    const currencyId = Number(currencyIdParam);

    if (currencyId) {
      this.isLoading.set(true);
      this.vaultService.getUnifiedVault(currencyId).subscribe({
        next: (response) => {
          this.vault.set(response);
          this.loadTransactions(currencyId);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    }
  }

  loadTransactions(currencyId: number, filter?: IVaultTransactionFilter): void {
    this.vaultService.getUnifiedVaultTransactions(currencyId, filter).subscribe({
      next: (response) => {
        this.transactions.set(response);
      },
      error: () => {
      }
    });
  }

  onCurrencyChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const currencyId = Number(selectElement.value);
    this.router.navigate(['/vaults/unified', currencyId]);
    setTimeout(() => {
      this.loadUnifiedVault();
    }, 100);
  }

  applyFilters(): void {
    const currencyId = this.vault()?.currencyId;
    if (!currencyId) return;

    const filter: IVaultTransactionFilter = {
      transactionType: this.filterForm.value.transactionType ? Number(this.filterForm.value.transactionType) : undefined,
      fromDate: this.filterForm.value.fromDate || undefined,
      toDate: this.filterForm.value.toDate || undefined
    };

    this.loadTransactions(currencyId, filter);
  }

  clearFilters(): void {
    this.filterForm.reset({
      transactionType: '',
      fromDate: '',
      toDate: ''
    });
    const currencyId = this.vault()?.currencyId;
    if (currencyId) {
      this.loadTransactions(currencyId);
    }
  }

  goBack(): void {
    this.router.navigate(['/vaults']);
  }

  get TransactionType() {
    return TransactionType;
  }

  get TransactionReferenceType() {
    return TransactionReferenceType;
  }
}
