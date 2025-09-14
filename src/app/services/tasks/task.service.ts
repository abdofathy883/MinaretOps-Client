import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { CustomTaskStatus, ICreateTask, ICreateTaskGroup, ITask, ITaskGroup, IUpdateTask } from '../../model/task/task';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private endpoint = 'tasks';
  constructor(private api: ApiService) { }

  getAll(): Observable<ITask[]> {
    return this.api.get<ITask[]>(`${this.endpoint}`);
  }

  getById(taskId: number): Observable<ITask> {
    return this.api.get<ITask>(`${this.endpoint}/task/${taskId}`);
  }

  getTasksByEmployee(employeeId: string): Observable<ITask[]> {
    return this.api.get<ITask[]>(`${this.endpoint}/emp-tasks/${employeeId}`);
  }

  update(taskId: number, updateTask: IUpdateTask): Observable<any> {
    return this.api.put<any>(`${this.endpoint}/update-task/${taskId}`, updateTask);
  }

  changeStatus(taskId: number, status: CustomTaskStatus): Observable<any> {
    return this.api.patch<any>(`${this.endpoint}/change-status/${taskId}`, status);
  }

  addTask(createTask: ICreateTask): Observable<ITask> {
    return this.api.post<ITask>(`${this.endpoint}/create-task`, createTask);
  }

  deleteTask(taskId: number): Observable<boolean> {
    return this.api.delete<boolean>(`${this.endpoint}/delete-task/${taskId}`)
  }

  addTaskGroup(createTaskGroup: ICreateTaskGroup): Observable<ITaskGroup> {
    return this.api.post<ITaskGroup>(`${this.endpoint}/create-task-group`, createTaskGroup);
  }

  getTaskGroupsByClientService(clientServiceId: number): Observable<ITaskGroup[]> {
    return this.api.get<ITaskGroup[]>(`${this.endpoint}/client-service/${clientServiceId}/task-groups`);
  }
}
