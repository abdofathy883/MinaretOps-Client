// Tasks
export interface ITask {
  id: number;
  title: string;
  description: string;
  status: CustomTaskStatus;
  clientServiceId: number;
  deadline: Date;
  priority: string;
  refrence?: string;
  employeeId: string;
  employeeName: string;
  taskGroupId: number;
  serviceId: number;
  serviceName: string;
  clientName: string;
  completedAt?: Date;
  isCompletedOnDeadLine: boolean;
}

export enum CustomTaskStatus {
  Open = 0,
  Acknowledged = 1,
  InProgress = 2,
  UnderReview = 3,
  NeedsEdits = 4,
  Completed = 5,
}

// Task-related interfaces
export interface ICreateTask {
  title: string;
  description: string;
  status: CustomTaskStatus;
  clientServiceId: number;
  deadline: Date;
  priority: string;
  refrence?: string;
  employeeId: string;
  taskGroupId: number;
}

export interface IUpdateTask {
    title?: string;
    description?: string;
    deadline?: Date;
    status?: CustomTaskStatus; 
    priority?: string;
    refrence?: string;
    employeeId?: string;
}

// Task Groups
export interface ICreateTaskGroup {
  clientServiceId: number;
  tasks: ICreateTask[];
}

export interface ITaskGroup {
  id: number;
  clientServiceId: number;
  month: number;
  year: number;
  monthLabel: string;
  tasks: ITask[];
  createdAt: Date;
  updatedAt: Date;
}

// export interface CreateTaskItem {
//   title: string;
//   description: string;
//   employeeId?: string;
//   deadline: Date;
//   priority: string;
//   refrence?: string;
// }


