import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { ICreateLead, ISalesLead, IUpdateLead } from '../../model/sales/i-sales-lead';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private endpoint: string = 'leads';

  constructor(private api: ApiService) { }

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
}
