import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { CreateTaskDTO, CreateTaskGroupDTO, CustomTaskStatus, TaskDTO, TaskGroupDTO } from '../../model/client/client';
import { UpdateTaskDTO } from '../../model/task/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private endpoint = 'tasks';
  constructor(private api: ApiService) { }

  getAll(): Observable<TaskDTO[]> {
    return this.api.get<TaskDTO[]>(`${this.endpoint}`);
  }

  getById(taskId: number): Observable<TaskDTO> {
    return this.api.get<TaskDTO>(`${this.endpoint}/task/${taskId}`);
  }

  getTasksByEmployee(employeeId: string): Observable<TaskDTO[]> {
    return this.api.get<TaskDTO[]>(`${this.endpoint}/emp-tasks/${employeeId}`);
  }

  update(taskId: number, updateTask: UpdateTaskDTO): Observable<any> {
    return this.api.put<any>(`${this.endpoint}/update-task/${taskId}`, updateTask);
  }

  changeStatus(taskId: number, status: CustomTaskStatus): Observable<any> {
    return this.api.patch<any>(`${this.endpoint}/change-status/${taskId}`, status);
  }

  addTask(createTask: CreateTaskDTO): Observable<TaskDTO> {
    return this.api.post<TaskDTO>(`${this.endpoint}/create-task`, createTask);
  }

  addTaskGroup(createTaskGroup: CreateTaskGroupDTO): Observable<TaskGroupDTO> {
    return this.api.post<TaskGroupDTO>(`${this.endpoint}/create-task-group`, createTaskGroup);
  }

  getTaskGroupsByClientService(clientServiceId: number): Observable<TaskGroupDTO[]> {
    return this.api.get<TaskGroupDTO[]>(`${this.endpoint}/client-service/${clientServiceId}/task-groups`);
  }
}
