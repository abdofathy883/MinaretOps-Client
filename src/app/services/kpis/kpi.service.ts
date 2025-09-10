import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { ICreateIncedint } from '../../model/kpis/icreate-incedint';

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  private endpoint = 'kpi'
  constructor(private api: ApiService) { }

  create(incedint: ICreateIncedint) {
    return this.api.post(this.endpoint, incedint);
  }
}
