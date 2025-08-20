import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { CreateServiceRequest, Service } from '../../model/service/service';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private endpoint = 'service';
  constructor(private api: ApiService) { }

  getAll(): Observable<Service[]> {
    return this.api.get(`${this.endpoint}`);
  }

  getById(id: number): Observable<Service> {
    return this.api.get(`${this.endpoint}/${id}`);
  }

  create(data: CreateServiceRequest): Observable<Service> {
    return this.api.post(`${this.endpoint}`, data);
  }

  update(id: number, data: CreateServiceRequest): Observable<Service> {
    return this.api.put(`${this.endpoint}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${this.endpoint}/${id}`);
  }

  toggleVisibility(id: number): Observable<Service> {
    return this.api.patch(`${this.endpoint}/${id}`, {});
  }
}
