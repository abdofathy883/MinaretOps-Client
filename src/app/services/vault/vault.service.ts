import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import { IVault } from '../../model/vault/i-vault';
import {
  IVaultTransaction,
  ICreateVaultTransaction,
  IUpdateVaultTransaction,
  IVaultTransactionFilter
} from '../../model/vault-transaction/i-vault-transaction';

@Injectable({
  providedIn: 'root'
})
export class VaultService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'vault';

  getAll(): Observable<IVault[]> {
    return this.api.get<IVault[]>(this.endpoint);
  }

  getAllLocal(): Observable<IVault[]> {
    return this.api.get<IVault[]>(`${this.endpoint}/local`);
  }

  getById(id: number): Observable<IVault> {
    return this.api.get<IVault>(`${this.endpoint}/${id}`);
  }

  getUnifiedVault(currencyId: number): Observable<IVault> {
    return this.api.get<IVault>(`${this.endpoint}/unified/${currencyId}`);
  }

  getVaultBalance(vaultId: number, currencyId?: number): Observable<{ vaultId: number; currencyId?: number; balance: number }> {
    const params = currencyId ? `?currencyId=${currencyId}` : '';
    return this.api.get<{ vaultId: number; currencyId?: number; balance: number }>(`${this.endpoint}/${vaultId}/balance${params}`);
  }

  getUnifiedVaultBalance(currencyId: number): Observable<{ currencyId: number; balance: number }> {
    return this.api.get<{ currencyId: number; balance: number }>(`${this.endpoint}/unified/${currencyId}/balance`);
  }

  getVaultTransactions(vaultId: number, filter?: IVaultTransactionFilter): Observable<IVaultTransaction[]> {
    const params = this.buildFilterParams(filter);
    return this.api.get<IVaultTransaction[]>(`${this.endpoint}/${vaultId}/transactions${params}`);
  }

  getUnifiedVaultTransactions(currencyId: number, filter?: IVaultTransactionFilter): Observable<IVaultTransaction[]> {
    const params = this.buildFilterParams(filter);
    return this.api.get<IVaultTransaction[]>(`${this.endpoint}/unified/${currencyId}/transactions${params}`);
  }

  createTransaction(transaction: ICreateVaultTransaction): Observable<IVaultTransaction> {
    return this.api.post<IVaultTransaction>(`${this.endpoint}/transactions`, transaction);
  }

  updateTransaction(id: number, transaction: IUpdateVaultTransaction): Observable<IVaultTransaction> {
    return this.api.put<IVaultTransaction>(`${this.endpoint}/transactions/${id}`, transaction);
  }

  deleteTransaction(id: number): Observable<boolean> {
    return this.api.delete<boolean>(`${this.endpoint}/transactions/${id}`);
  }

  private buildFilterParams(filter?: IVaultTransactionFilter): string {
    if (!filter) return '';
    
    const params: string[] = [];
    if (filter.transactionType !== undefined) params.push(`transactionType=${filter.transactionType}`);
    if (filter.referenceType !== undefined) params.push(`referenceType=${filter.referenceType}`);
    if (filter.currencyId !== undefined) params.push(`currencyId=${filter.currencyId}`);
    if (filter.fromDate) params.push(`fromDate=${filter.fromDate}`);
    if (filter.toDate) params.push(`toDate=${filter.toDate}`);
    if (filter.referenceId !== undefined) params.push(`referenceId=${filter.referenceId}`);
    
    return params.length > 0 ? `?${params.join('&')}` : '';
  }
}
