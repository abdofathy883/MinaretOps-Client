import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import {
  ICreateIncedint,
  IIncedint,
  IKpiSummary,
} from '../../model/kpis/icreate-incedint';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KpiService {
  private endpoint = 'kpi';
  constructor(private api: ApiService) {}

  create(incedint: FormData): Observable<IIncedint> {
    return this.api.post<IIncedint>(this.endpoint, incedint);
  }

  getMySummary(employeeId: string): Observable<IKpiSummary> {
    return this.api.get<IKpiSummary>(`${this.endpoint}/summary/${employeeId}`);
  }

  getIncidentsByEmpId(employeeId: string): Observable<IIncedint[]> {
    return this.api.get<IIncedint[]>(
      `${this.endpoint}/incidents/${employeeId}`
    );
  }

  // Admin
  getSummaries(): Observable<IKpiSummary[]> {
    return this.api.get<IKpiSummary[]>(`${this.endpoint}/all-summaries`);
  }

  getAllIncidents(): Observable<IIncedint[]> {
    return this.api.get<IIncedint[]>(`${this.endpoint}/get-all-incedints`);
  }
}
