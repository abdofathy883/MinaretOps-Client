// export interface CreateClient {
//     name: string;
//     personalPhoneNumber: string;
//     companyName: string;
//     companyPhoneNumber: string;
//     driveLink: string;
//     businessDescription: string;
//     servicesId: number[];
//     tasks?: CreateTaskItem[];
// }

// export interface CreateTaskItem {
//     title: string;
//     description: string;
//     employeeId?: string;
//     deadline: Date;
//     priority: string;
//     refrence?: string; 
// }


export interface LightWieghtClient {
    id: number;
    name: string;
    companyName: string;
    status: ClientStatus;
    serviceId: number;
    serviceTitle: string;
}

// --------------------------------------------------
// Enums matching server-side enums
export enum ClientStatus {
    Active = 0,
    OnHold = 1,
    Cancelled = 2
}

export enum CustomTaskStatus {
    NotStarted = 0,
    Delivered = 1,
    InProgress = 2,
    Completed = 3
}

// Task-related interfaces
export interface CreateTaskDTO {
    title: string;
    description: string;
    status: CustomTaskStatus;
    clientServiceId: number;
    deadline: Date;
    priority: string;
    refrence?: string;
    employeeId: string;
    completedAt?: Date;
    taskGroupId: number;
}

export interface CreateTaskGroupDTO {
    clientServiceId: number;
    month: number; // 1-12
    year: number;
    monthLabel: string; // e.g., "August 2024"
    tasks: CreateTaskDTO[];
}

// Client Service interfaces
export interface CreateClientServiceDTO {
    clientId: number;
    serviceId: number;
    taskGroups: CreateTaskGroupDTO[];
}

// Main client creation interface matching CreateClientDTO
export interface CreateClient {
    name: string;
    companyName?: string;
    personalPhoneNumber: string;
    companyNumber?: string;
    businessDescription: string;
    driveLink?: string;
    status: ClientStatus;
    clientServices: CreateClientServiceDTO[];
}

// Legacy interface for backward compatibility (keeping the old structure)
export interface CreateClientLegacy {
    name: string;
    personalPhoneNumber: string;
    companyName: string;
    companyPhoneNumber: string;
    driveLink: string;
    businessDescription: string;
    servicesId: number[];
    tasks?: CreateTaskItem[];
}

// Legacy task item interface for backward compatibility
export interface CreateTaskItem {
    title: string;
    description: string;
    employeeId?: string;
    deadline: Date;
    priority: string;
    refrence?: string; 
}

// Response interfaces matching server-side DTOs
export interface TaskDTO extends CreateTaskDTO {
    id: number;
    isCompletedOnDeadline: boolean;
    clientName: string;
    serviceName: string;
    employeeName: string;
    serviceId: number;
    clientId: number;
}

export interface TaskGroupDTO extends CreateTaskGroupDTO {
    id: number;
    tasks: TaskDTO[];
}

export interface ClientServiceDTO {
    id: number;
    clientId: number;
    clientName: string;
    serviceId: number;
    serviceTitle: string;
    startDate: Date;
    endDate?: Date;
    taskItems: TaskDTO[];
    taskGroups: TaskGroupDTO[];
}

export interface ClientDTO {
    id: number;
    name: string;
    companyName?: string;
    personalPhoneNumber: string;
    companyNumber?: string;
    businessDescription: string;
    driveLink?: string;
    status: ClientStatus;
    statusNotes?: string;
    createdAt: Date;
    updatedAt?: Date;
    clientServices: ClientServiceDTO[];
}

export interface ServiceDTO {
    id: number;
    title: string;
    description?: string;
    createdAt: Date;
    clientServices: ClientServiceDTO[];
}


export interface UpdateClientDTO{
    name: string;
    personalPhoneNumber: string;
    companyName: string;
    companyNumber: string;
    businessDescription: string;
    driveLink: string;
    status: ClientStatus;
    statusNotes: string;
}