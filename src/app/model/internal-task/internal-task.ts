import { CustomTaskStatus } from "../client/client";

export interface InternalTask {
  id: number;
  title: string;
  description: string;
  deadline: string;
  priority: string;
  status: CustomTaskStatus;
  completedAt: Date;
  isCompletedOnDeadline: boolean;
  assignments: InternalTaskAssignment[];
}

export interface InternalTaskAssignment {
  id: number;
  internalTaskId: number;
  userId: string;
  isLeader: boolean;
}

export interface CreateInternalTask {
  title: string;
  description: string;
  deadline: string;
  priority: string;
  assignments: CreateInternalTaskAssignment[];
}

export interface CreateInternalTaskAssignment {
  userId: string;
  isLeader: boolean;
}
