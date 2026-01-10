import { IClientServiceCheckpoint } from "../checkpoint/i-service-checkpoint";
import { ICreateTaskGroup, ITask, ITaskGroup } from "../task/task";

export interface LightWieghtClient {
  id: number;
  name: string;
  companyName: string;
  status: ClientStatus;
  serviceId: number;
  serviceTitle: string;
  accountManagerId: string;
  accountManagerName: string;
}

export enum ClientStatus {
  Active = 0,
  OnHold = 1,
  Cancelled = 2,
}

export enum BusinessType {
  Individual = 0,
  Commercial = 1
}

// Client Service interfaces
export interface ICreateClientService {
  serviceId: number;
  serviceCost: number;
  selectedCheckpointIds?: number[];
  taskGroups: ICreateTaskGroup[];
}

// Main client creation interface matching CreateClientDTO
export interface ICreateClient {
  name: string;
  companyName?: string;
  personalPhoneNumber: string;
  companyNumber?: string;
  email: string;
  businessDescription: string;
  driveLink: string;
  businessType: BusinessType;
  businessActivity?: string;
  commercialRegisterNumber?: string;
  taxCardNumber?: string;
  country?: string;
  accountManagerId?: string;
  status: ClientStatus;
  clientServices: ICreateClientService[];
}

export interface IClientService {
  id: number;
  clientId: number;
  clientName: string;
  serviceId: number;
  serviceTitle: string;
  serviceCost: number;
  taskItems: ITask[];
  taskGroups: ITaskGroup[];
  clientServiceCheckpoints: IClientServiceCheckpoint[];
}

export interface IClient {
  id: number;
  name: string;
  companyName?: string;
  personalPhoneNumber: string;
  companyNumber?: string;
  email: string;
  businessDescription: string;
  driveLink?: string;
  businessType: BusinessType;
  businessActivity?: string;
  commercialRegisterNumber?: string;
  taxCardNumber?: string;
  country?: string;
  accountManagerId: string;
  accountManagerName: string;
  discordChannelId?: string;
  status: ClientStatus;
  statusNotes?: string;
  createdAt: Date;
  updatedAt?: Date;
  clientServices: IClientService[];
}

export interface IService {
  id: number;
  title: string;
  description?: string;
  createdAt: Date;
  clientServices: IClientService[];
}

export interface IUpdateClient {
  name: string;
  personalPhoneNumber: string;
  companyName: string;
  companyNumber: string;
  email: string;
  businessDescription: string;
  driveLink: string;
  businessType: BusinessType;
  businessActivity?: string;
  commercialRegisterNumber?: string;
  taxCardNumber?: string;
  country?: string;
  accountManagerId: string;
  discordChannelId: string;
  status: ClientStatus;
  statusNotes: string;
}
