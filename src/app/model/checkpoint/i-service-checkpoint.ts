export interface IServiceCheckpoint {
  id: number;
  serviceId: number;
  name: string;
  description?: string;
  order: number;
  createdAt: Date;
}

export interface ICreateServiceCheckpoint {
  serviceId: number;
  name: string;
  description?: string;
  order: number;
}

export interface IClientServiceCheckpoint {
  id: number;
  clientServiceId: number;
  serviceCheckpointId: number;
  serviceCheckpointName: string;
  serviceCheckpointDescription?: string;
  serviceCheckpointOrder: number;
  isCompleted: boolean;
  completedAt?: Date;
  completedByEmployeeId?: string;
  completedByEmployeeName?: string;
  createdAt: Date;
}

export interface IMarkCheckpointComplete {
  clientServiceCheckpointId: number;
  employeeId: string;
}