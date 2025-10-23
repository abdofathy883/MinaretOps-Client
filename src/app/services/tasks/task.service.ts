import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import {
  CustomTaskStatus,
  ICreateTask,
  ICreateTaskGroup,
  ICreateTaskResources,
  ITask,
  ITaskGroup,
  IUpdateTask,
  PaginatedTaskResult,
  TaskFilter,
} from '../../model/task/task';

// export interface TaskFilter {
//   fromDate?: string;
//   toDate?: string;
//   employeeId?: string;
//   clientId?: number;
//   status?: number;
//   priority?: string;
//   onDeadline?: string;
//   team?: string;
//   pageNumber: number;
//   pageSize: number;
// }

// export interface PaginatedTaskResult {
//   records: ITask[];
//   totalRecords: number;
//   pageNumber: number;
//   pageSize: number;
//   totalPages: number;
// }

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private endpoint = 'tasks';
  constructor(private api: ApiService) {}

  // getAll(): Observable<ITask[]> {
  //   return this.api.get<ITask[]>(`${this.endpoint}/un-archived-tasks`);
  // }

  getArchivedTasks(): Observable<ITask[]> {
    return this.api.get<ITask[]>(`${this.endpoint}/archived-tasks`);
  }

  getById(taskId: number): Observable<ITask> {
    return this.api.get<ITask>(`${this.endpoint}/task/${taskId}`);
  }

  getTasksByEmployee(employeeId: string): Observable<ITask[]> {
    return this.api.get<ITask[]>(`${this.endpoint}/emp-tasks/${employeeId}`);
  }

  update(
    taskId: number,
    empId: string,
    updateTask: IUpdateTask
  ): Observable<ITask> {
    return this.api.put<ITask>(
      `${this.endpoint}/update-task/${taskId}/${empId}`,
      updateTask
    );
  }

  changeStatus(
    taskId: number,
    empId: string,
    status: CustomTaskStatus
  ): Observable<boolean> {
    return this.api.patch<boolean>(
      `${this.endpoint}/change-status/${taskId}/${empId}`,
      status
    );
  }

  archive(taskId: number): Observable<ITask> {
    return this.api.patch<ITask>(
      `${this.endpoint}/toggle-archive/${taskId}`,
      null
    );
  }

  complete(
    taskId: number,
    userId: string,
    taskResource: ICreateTaskResources
  ): Observable<ITask> {
    return this.api.patch<ITask>(
      `${this.endpoint}/complete/${taskId}/${userId}`,
      taskResource
    );
  }

  addTask(createTask: ICreateTask, userId: string): Observable<ITask> {
    return this.api.post<ITask>(
      `${this.endpoint}/create-task/${userId}`,
      createTask
    );
  }

  deleteTask(taskId: number): Observable<boolean> {
    return this.api.delete<boolean>(`${this.endpoint}/delete-task/${taskId}`);
  }

  addTaskGroup(
    createTaskGroup: ICreateTaskGroup,
    userId: string
  ): Observable<ITaskGroup> {
    return this.api.post<ITaskGroup>(
      `${this.endpoint}/create-task-group/${userId}`,
      createTaskGroup
    );
  }

  getTaskGroupsByClientService(
    clientServiceId: number
  ): Observable<ITaskGroup[]> {
    return this.api.get<ITaskGroup[]>(
      `${this.endpoint}/client-service/${clientServiceId}/task-groups`
    );
  }

  searchTasks(query: string, currentUserId: string): Observable<ITask[]> {
    return this.api.get<ITask[]>(
      `${this.endpoint}/search/${query}/${currentUserId}`
    );
  }

  // Update the getPaginatedTasks method to include team parameter

  getPaginatedTasks(
    filter: TaskFilter,
    currentUserId: string
  ): Observable<PaginatedTaskResult> {
    let url = `${this.endpoint}/paginated?pageNumber=${filter.pageNumber}&pageSize=${filter.pageSize}&currentUserId=${currentUserId}`;

    if (filter.fromDate) {
      url += `&fromDate=${filter.fromDate}`;
    }
    if (filter.toDate) {
      url += `&toDate=${filter.toDate}`;
    }
    if (filter.employeeId) {
      url += `&employeeId=${filter.employeeId}`;
    }
    if (filter.clientId) {
      url += `&clientId=${filter.clientId}`;
    }
    if (filter.status !== undefined) {
      url += `&status=${filter.status}`;
    }
    if (filter.priority) {
      url += `&priority=${filter.priority}`;
    }
    if (filter.onDeadline) {
      url += `&onDeadline=${filter.onDeadline}`;
    }
    if (filter.team) {
      // Add team parameter back
      url += `&team=${filter.team}`;
    }

    return this.api.get<PaginatedTaskResult>(url);
  }
}
