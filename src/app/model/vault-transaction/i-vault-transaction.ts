import { VaultType } from '../vault/i-vault';

export interface IVaultTransaction {
  id: number;
  vaultId: number;
  vaultBranchName?: string;
  vaultType: VaultType;
  transactionType: TransactionType;
  amount: number;
  currencyId: number;
  currencyName: string;
  currencyCode: string;
  transactionDate: string;
  description?: string;
  referenceType: TransactionReferenceType;
  referenceId?: number;
  notes?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface ICreateVaultTransaction {
  vaultId: number;
  transactionType: TransactionType;
  amount: number;
  transactionDate: string;
  description?: string;
  referenceType: TransactionReferenceType;
  referenceId?: number;
  notes?: string;
}

export interface IUpdateVaultTransaction {
  transactionDate: string;
  description?: string;
  notes?: string;
}

export interface IVaultTransactionFilter {
  vaultId?: number;
  transactionType?: TransactionType;
  referenceType?: TransactionReferenceType;
  currencyId?: number;
  fromDate?: string;
  toDate?: string;
  referenceId?: number;
}

export enum TransactionType {
  Incoming = 0,
  Outgoing = 1
}

export enum TransactionReferenceType {
  Manual = 0,
  ContractPayment = 1,
  SalaryPayment = 2,
  Expense = 3,
  Transfer = 4
}
