// Tasks
export interface ITask {
  id: number;
  title: string;
  taskType: TaskType;
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
  clientId: number;
  clientName: string;
  completedAt?: Date;
  isCompletedOnDeadline: boolean;
  taskHistory: ITaskHistory[];
  taskResources: ITaskResources[];
  taskComments: ITaskComment[];
  completionNotes: string;
  createdAt: Date;
}

export enum CustomTaskStatus {
  Open = 0,
  Acknowledged = 1,
  InProgress = 2,
  UnderReview = 3,
  NeedsEdits = 4,
  Completed = 5,
}

export enum TaskType {
  Planning = 0,
  ContentStrategy = 1,
  ContentWriting = 2,
  LogoDesign = 3,
  VisualIdentity = 4,
  DesignDirections = 5,
  SM_Design = 6,
  PrintingsDesign = 7,
  Illustrations = 8,
  Voiceover = 9,
  Motion = 10,
  VideoEditing = 11,
  Publishing = 12,
  Moderation = 13,
  Ad_Management = 14,
  E_mailMarketing = 15,
  WhatsAppMarketing = 16,
  UI_UX = 17,
  WordPress = 18,
  Backend = 19,
  Frontend = 20,
  SEO = 21,
  Meeting = 22,
  HostingManagement = 23,
}

// Task-related interfaces
export interface ICreateTask {
  title: string;
  taskType: TaskType;
  description: string;
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
  clientId: number;
  serviceId: number;
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

export interface ITaskHistory {
  id: number;
  taskItemId: number;
  propertyName: string;
  oldValue: string;
  newValue: string;
  updatedById: string;
  updatedByName: string;
  updatedAt: Date;
}

export interface ICreateTaskResources {
  taskId: number;
  urls: string[];
  completionNotes?: string;
}

export interface ITaskResources {
  id: number;
  taskId: number;
  url: string;
}

// export interface CreateTaskItem {
//   title: string;
//   description: string;
//   employeeId?: string;
//   deadline: Date;
//   priority: string;
//   refrence?: string;
// }

export enum TaskTeam {
  All = 'all',
  ContentCreation = 'content-creation',
  Design = 'design',
  Software = 'software',
  Video = 'video',
  SEO = 'seo',
  ADs = 'ads',
  Management = 'management'
}

export interface TaskTeamMapping {
  team: TaskTeam;
  name: string;
  taskTypes: TaskType[];
}

export const TASK_TEAM_MAPPINGS: TaskTeamMapping[] = [
  {
    team: TaskTeam.ContentCreation,
    name: 'فريق إنشاء المحتوى',
    taskTypes: [
      TaskType.ContentStrategy,
      TaskType.ContentWriting
    ]
  },
  {
    team: TaskTeam.Video,
    name: 'فريق الفيديو',
    taskTypes: [
      TaskType.Voiceover,
      TaskType.VideoEditing,
      TaskType.Motion
    ]
  },
  {
    team: TaskTeam.SEO,
    name: 'فريق تحسين محركات البحث',
    taskTypes: [
      TaskType.SEO
    ]
  },
  {
    team: TaskTeam.ADs,
    name: 'فريق الإعلانات',
    taskTypes: [
      TaskType.Ad_Management,
      TaskType.E_mailMarketing,
      TaskType.WhatsAppMarketing
    ]
  },
  {
    team: TaskTeam.Design,
    name: 'فريق التصميم',
    taskTypes: [
      TaskType.LogoDesign,
      TaskType.VisualIdentity,
      TaskType.DesignDirections,
      TaskType.SM_Design,
      TaskType.PrintingsDesign,
      TaskType.Illustrations,
      TaskType.UI_UX
    ]
  },
  {
    team: TaskTeam.Software,
    name: 'فريق البرمجيات',
    taskTypes: [
      TaskType.WordPress,
      TaskType.Backend,
      TaskType.Frontend,
    ]
  },
  {
    team: TaskTeam.Management,
    name: 'فريق الإدارة',
    taskTypes: [
      TaskType.Planning,
      TaskType.Meeting,
      TaskType.HostingManagement,
      TaskType.Publishing,
      TaskType.Moderation
    ]
  }
];

export interface TaskFilter {
  fromDate?: string;
  toDate?: string;
  employeeId?: string;
  clientId?: number;
  status?: number;
  priority?: string;
  onDeadline?: string;
  team?: TaskTeam; // Add team filter
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedTaskResult {
  records: ITask[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ICreateTaskComment {
  employeeId: string;
  taskId: number;
  comment: string;
}

export interface ITaskComment {
  employeeId: string;
  employeeName: string;
  comment: string;
  taskId: number;
  createdAt: Date;
}