import { ICreateTaskGroup, ITask, ITaskGroup } from "../task/task";

export interface LightWieghtClient {
  id: number;
  name: string;
  companyName: string;
  status: ClientStatus;
  serviceId: number;
  serviceTitle: string;
}

export enum ClientStatus {
  Active = 0,
  OnHold = 1,
  Cancelled = 2,
}


// Client Service interfaces
export interface ICreateClientService {
  clientId: number;
  serviceId: number;
  taskGroups: ICreateTaskGroup[];
}

// Main client creation interface matching CreateClientDTO
export interface ICreateClient {
  name: string;
  companyName?: string;
  personalPhoneNumber: string;
  companyNumber?: string;
  businessDescription: string;
  driveLink: string;
  discordChannelId?: string;
  status: ClientStatus;
  clientServices: ICreateClientService[];
}

export interface IClientService {
  id: number;
  clientId: number;
  clientName: string;
  serviceId: number;
  serviceTitle: string;
  startDate: Date;
  endDate?: Date;
  taskItems: ITask[];
  taskGroups: ITaskGroup[];
}

export interface IClient {
  id: number;
  name: string;
  companyName?: string;
  personalPhoneNumber: string;
  companyNumber?: string;
  businessDescription: string;
  driveLink?: string;
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
  businessDescription: string;
  driveLink: string;
  discordChannelId: string;
  status: ClientStatus;
  statusNotes: string;
}
