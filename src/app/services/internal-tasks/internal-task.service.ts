import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { CreateInternalTask, InternalTask, UpdateInternalTask } from '../../model/internal-task/internal-task';
import { CustomTaskStatus } from '../../model/task/task';

@Injectable({
  providedIn: 'root'
})
export class InternalTaskService {
  private endpoint = 'internaltask';
  constructor(private api: ApiService) { }

  // getAll(): Observable<InternalTask[]> {
  //   return this.api.get<InternalTask[]>(`${this.endpoint}/un-archived-tasks`);
  // }

  getArchivedTasks(): Observable<InternalTask[]> {
    return this.api.get<InternalTask[]>(`${this.endpoint}/archived-tasks`)
  }

  getTasksByEmp(empId: string): Observable<InternalTask[]> {
    return this.api.get<InternalTask[]>(`${this.endpoint}/emp-tasks/${empId}`);
  }

  getById(id: number): Observable<InternalTask> {
    return this.api.get<InternalTask>(`${this.endpoint}/${id}`);
  }

  search(title: string, empId: string): Observable<InternalTask[]> {
    return this.api.get<InternalTask[]>(`${this.endpoint}/search-tasks/${title}/${empId}`);
  }

  add(task: CreateInternalTask): Observable<InternalTask> {
    return this.api.post<InternalTask>(this.endpoint, task);
  }

  changeTaskStatus(id: number, status: CustomTaskStatus): Observable<boolean> {
    return this.api.patch<boolean>(`${this.endpoint}/${id}`, status);
  }

  archive(taskId: number) : Observable<boolean> {
    return this.api.patch<boolean>(`${this.endpoint}/archive/${taskId}`, null);
  }

  delete(taskId: number): Observable<boolean> {
    return this.api.delete<boolean>(`${this.endpoint}/${taskId}`);
  }

  update(taskId: number, updatedTask: UpdateInternalTask): Observable<InternalTask> {
    return this.api.put<InternalTask>(`${this.endpoint}/${taskId}`, updatedTask);
  }
}
