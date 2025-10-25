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

  getMySummary(employeeId: string, month?: number, year?: number): Observable<IKpiSummary> {
    let params = new HttpParams();
    if (month !== undefined && month !== null) {
      params = params.set('month', month.toString());
    }
    if (year !== undefined && year !== null) {
      params = params.set('year', year.toString());
    }
    const url = `${this.endpoint}/summary/${employeeId}`;
    const query = params.keys().length ? `?${params.toString()}` : '';
    return this.api.get<IKpiSummary>(`${url}${query}`);
  }

  getIncidentsByEmpId(employeeId: string, month?: number, year?: number): Observable<IIncedint[]> {
    let params = new HttpParams();
    if (month !== undefined && month !== null) {
      params = params.set('month', month.toString());
    }
    if (year !== undefined && year !== null) {
      params = params.set('year', year.toString());
    }
    const url = `${this.endpoint}/incidents/${employeeId}`;
    const query = params.keys().length ? `?${params.toString()}` : '';
    return this.api.get<IIncedint[]>(`${url}${query}`);
  }

  // Admin
  getSummaries(month?: number, year?: number): Observable<IKpiSummary[]> {
    let params = new HttpParams();
    if (month !== undefined && month !== null) {
      params = params.set('month', month.toString());
    }
    if (year !== undefined && year !== null) {
      params = params.set('year', year.toString());
    }
    const url = `${this.endpoint}/all-summaries/`;
    const query = params.keys().length ? `?${params.toString()}` : '';
    return this.api.get<IKpiSummary[]>(`${url}${query}`);
  }

  getAllIncidents(): Observable<IIncedint[]> {
    return this.api.get<IIncedint[]>(`${this.endpoint}/get-all-incedints`);
  }
}
