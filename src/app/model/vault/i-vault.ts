export enum VaultType {
  Branch = 0,
  Unified = 1
}

export interface IVault {
  id: number;
  vaultType: VaultType;
  branchId?: number;
  branchName?: string;
  currencyId: number;
  currencyName: string;
  currencyCode: string;
  createdAt: string;
  balance: number;
}
