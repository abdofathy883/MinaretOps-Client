import { Component, signal, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VaultService } from '../../../services/vault/vault.service';
import { CurrencyService } from '../../../services/currency/currency.service';
import { IVault } from '../../../model/vault/i-vault';
import { ICurrency } from '../../../model/currency/i-currency';
import { ShimmerComponent } from '../../../shared/shimmer/shimmer.component';

@Component({
  selector: 'app-all-vaults',
  imports: [CommonModule, ShimmerComponent],
  templateUrl: './all-vaults.component.html',
  styleUrl: './all-vaults.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllVaultsComponent implements OnInit {
  vaults = signal<IVault[]>([]);
  currencies = signal<ICurrency[]>([]);
  selectedCurrencyId = signal<number | null>(1);
  isLoading = signal<boolean>(false);
  unifiedVault = signal<IVault | null>(null);

  constructor(
    private vaultService: VaultService,
    private currencyService: CurrencyService,
    private router: Router
  ) {}

  filteredVaults = computed(() => {
    const currencyId = this.selectedCurrencyId();
    if (!currencyId) return this.vaults();
    return this.vaults().filter(v => v.currencyId === currencyId);
  });

  ngOnInit(): void {
    this.loadVaults();
    this.loadUnifiedVault();
    this.loadCurrencies();
  }

  loadVaults(): void {
    this.isLoading.set(true);
    this.vaultService.getAllLocal().subscribe({
      next: (response) => {
        this.vaults.set(response);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadUnifiedVault() {
    const currency = this.selectedCurrencyId();
    if (currency === null) {
      this.unifiedVault.set(null);
      return;
    }
    this.vaultService.getUnifiedVault(currency).subscribe({
      next: (response) => {
        this.unifiedVault.set(response);
        console.log('Unified Vault:', this.unifiedVault());
      },
      error: (err) => {
        this.unifiedVault.set(null);
        console.error('Error loading unified vault:', err);
      }
    });
  }

  loadCurrencies(): void {
    this.currencyService.getAll().subscribe({
      next: (response) => {
        this.currencies.set(response);
      }
    });
  }

  onCurrencyFilterChange(currencyId: string): void {
    this.selectedCurrencyId.set(currencyId ? Number(currencyId) : null);
    this.loadUnifiedVault();
  }

  goToVault(id: number): void {
    this.router.navigate(['/vaults', id]);
  }

  goToUnifiedVault(currencyId?: number): void {
    this.router.navigate(['/vaults/unified', currencyId]);
  }
}
