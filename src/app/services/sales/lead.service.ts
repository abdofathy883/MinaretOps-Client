import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { ICreateLead, ISalesLead, IUpdateLead } from '../../model/sales/i-sales-lead';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private endpoint: string = 'leads';
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private api: ApiService, private http: HttpClient) { }

  getAll(): Observable<ISalesLead[]> {
    return this.api.get<ISalesLead[]>(this.endpoint);
  }

  getById(id: number): Observable<ISalesLead> {
    return this.api.get<ISalesLead>(`${this.endpoint}/${id}`);
  }

  create(lead: ICreateLead): Observable<ISalesLead> {
    return this.api.post<ISalesLead>(this.endpoint, lead);
  }

  updateField(id: number, fieldName: string, value: any): Observable<ISalesLead> {
    const payload = { fieldName, value };
    return this.api.patch<ISalesLead>(`${this.endpoint}/${id}`, payload);
  }

  update(lead: IUpdateLead): Observable<ISalesLead> {
    return this.api.put<ISalesLead>(this.endpoint, lead);
  }

  delete(id: number): Observable<boolean> {
    return this.api.delete<boolean>(`${this.endpoint}/${id}`);
  }

  importLeads(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<any>(`${this.endpoint}/import`, formData);
  }

  exportLeads(): Observable<Blob> {
    return this.http.get(`${this.apiBaseUrl}/${this.endpoint}/export`, { responseType: 'blob' });
  }

  getTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiBaseUrl}/${this.endpoint}/template`, { responseType: 'blob' });
  }
}
