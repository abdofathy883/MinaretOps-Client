import { Component, signal, OnInit, ChangeDetectionStrategy, inject, computed } from '@angular/core';
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
  private readonly vaultService = inject(VaultService);
  private readonly currencyService = inject(CurrencyService);
  private readonly router = inject(Router);

  vaults = signal<IVault[]>([]);
  currencies = signal<ICurrency[]>([]);
  selectedCurrencyId = signal<number | null>(null);
  isLoading = signal<boolean>(false);

  filteredVaults = computed(() => {
    const currencyId = this.selectedCurrencyId();
    if (!currencyId) return this.vaults();
    return this.vaults().filter(v => v.currencyId === currencyId);
  });

  ngOnInit(): void {
    this.loadVaults();
    this.loadCurrencies();
  }

  loadVaults(): void {
    this.isLoading.set(true);
    this.vaultService.getAll().subscribe({
      next: (response) => {
        this.vaults.set(response);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
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
  }

  goToVault(id: number): void {
    this.router.navigate(['/vaults', id]);
  }

  goToUnifiedVault(currencyId: number): void {
    this.router.navigate(['/vaults/unified', currencyId]);
  }
}
