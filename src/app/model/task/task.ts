import { CustomTaskStatus } from "../client/client";

export interface Task {
}

export interface UpdateTaskDTO{
    title?: string;
    description?: string;
    deadline?: Date;
    status?: CustomTaskStatus; 
    priority?: string;
    refrence?: string;
    employeeId?: string;
}
