import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { ICreateIncedint, IIncedint, IKpiSummary } from '../../model/kpis/icreate-incedint';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  private endpoint = 'kpi'
  constructor(private api: ApiService) { }

  create(incedint: ICreateIncedint) {
    return this.api.post(this.endpoint, incedint);
  }

  // getMySummary(employeeId: string, year: number, month: number): Observable<IKpiSummary> {
  //   const params = new HttpParams().set('year', year).set('month', month);
  //   return this.api.get<IKpiSummary>(`${this.endpoint}/summary/${employeeId}`, { params });
  //   }

  // getIncidents(employeeId: string, year: number, month: number): Observable<IIncedint[]> {
  //   const params = new HttpParams().set('employeeId', employeeId).set('year', year).set('month', month);
  //   return this.api.get<IIncedint[]>(`${this.endpoint}/incidents`, { params });
  // }

  // // Admin
  // getSummaries(year: number, month: number): Observable<IKpiSummary[]> {
  //   const params = new HttpParams().set('year', year).set('month', month);
  //   return this.api.get<IKpiSummary[]>(`${this.endpoint}/summary`, { params });
  // }
}
