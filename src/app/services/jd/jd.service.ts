import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { ICreateJD, IJD } from '../../model/jds/i-create-jd';

@Injectable({
  providedIn: 'root'
})
export class JdService {
  private endpoint = 'jd';
  constructor(private api: ApiService) { }

  getAll(): Observable<IJD[]> {
    return this.api.get<IJD[]>(`${this.endpoint}/jds`);
  }

  getAllRoles(): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/roles`);
  }

  create(jd: ICreateJD): Observable<IJD> {
    return this.api.post<IJD>(`${this.endpoint}`, jd);
  }

  getById(jdId: number): Observable<IJD> {
    return this.api.get<IJD>(`${this.endpoint}/${jdId}`);
  }

  update(jdId: number, jd: ICreateJD): Observable<IJD> {
    return this.api.put<IJD>(`${this.endpoint}/${jdId}`, jd);
  }
}
