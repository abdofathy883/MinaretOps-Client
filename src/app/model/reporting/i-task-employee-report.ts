import { ILightWieghtTask } from '../task/task';

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

export interface MonthlyAttendanceReport {
  fromDate: Date;
  toDate: Date;
  employees: EmployeeMonthlyAttendance[];
}

export interface EmployeeMonthlyAttendance {
  employeeId: string;
  employeeName: string;
  totalDaysPresent: number;
  totalDaysAbsent: number;
  totalDaysOnLeave: number;
  totalHoursWorked: number;
}
