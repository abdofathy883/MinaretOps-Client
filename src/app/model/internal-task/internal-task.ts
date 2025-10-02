import { CustomTaskStatus } from '../task/task';

export interface InternalTask {
  id: number;
  title: string;
  taskType: InternalTaskType;
  description: string;
  deadline: string;
  priority: string;
  status: CustomTaskStatus;
  isArchived: boolean;
  completedAt: Date;
  isCompletedOnDeadline: boolean;
  assignments: InternalTaskAssignment[];
}

export enum InternalTaskType {
  HRMeeting = 0,
  ManagementMeeting = 1,
  PotentialClientMeeting = 2,
  ExistingClientMeeting = 3,
  ProjectManagementMeeting = 4,
  TasksAllocation = 5,
  TasksUpdate = 6,
  UpdatingReports = 7,
  UpdatingKPIs = 8,
  ProductionFollowUp = 9,
  PaymentsAndFinance = 10,
  ClientOnboarding = 11,
  ClientFollowUp = 12,
  Quotations = 13,
  MarketingOffer = 14,
  SalesTeamHandling = 15,
  Recruitment = 16,
  Subscriptions = 17,
  FinancialAdjustments = 18,
  ModifyTables = 19,
  Check = 20,
}

export interface InternalTaskAssignment {
  id: number;
  internalTaskId: number;
  employeeId: string;
  employeeName: string;
  isLeader: boolean;
}

export interface CreateInternalTask {
  title: string;
  taskType: InternalTaskType;
  description: string;
  deadline: string;
  priority: string;
  assignments: CreateInternalTaskAssignment[];
}

export interface CreateInternalTaskAssignment {
  userId: string;
  isLeader: boolean;
}

export interface UpdateInternalTask {
  title: string;
  taskType: InternalTaskType;
  description: string;
  deadline: string;
  priority: string;
  status: CustomTaskStatus;
  assignments: CreateInternalTaskAssignment[];
}
