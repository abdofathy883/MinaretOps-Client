import { IVault, VaultType } from '../vault/i-vault';

export { VaultType } from '../vault/i-vault';

export interface IBranch {
  id: number;
  name: string;
  code?: string;
  createdAt: string;
  updatedAt?: string;
  vault?: IVault;
}

export interface ICreateBranch {
  name: string;
  code?: string;
  currencyId: number;
}

export interface IUpdateBranch {
  name: string;
  code?: string;
}
