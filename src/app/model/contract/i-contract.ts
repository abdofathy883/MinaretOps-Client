import { BusinessType } from '../client/client';

export interface IContract {
  id: number;
  currencyId: number;
  currencyName: string;
  clientId: number;
  clientName: string;
  serviceCost: number;
  serviceName: string;
  accountManagerName: string;
  country: string;
  businessType: BusinessType;
  contractDuration: number;
  contractTotal: number;
  paidAmount: number;
  dueAmount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ICreateContract {
  clientId: number;
  currencyId: number;
  contractDuration: number;
  contractTotal: number;
  paidAmount: number;
  vaultId: number;
  createdBy: string;
}
