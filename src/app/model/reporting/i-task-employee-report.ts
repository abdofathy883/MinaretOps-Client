import { ILightWieghtTask } from "../task/task";

// Task Employee Report
export interface TaskEmployeeReport {
    workingEmployees: EmployeeWithTasks[];
    onBreakEmployees: EmployeeWithTasks[];
    absentEmployees: EmployeeWithTasks[];
  }
  
  export interface EmployeeWithTasks {
    employeeId: string;
    employeeName: string;
    isOnBreak?: boolean;
    clockInTime?: Date;
    workingDuration?: string;
    tasks: ILightWieghtTask[];
  }