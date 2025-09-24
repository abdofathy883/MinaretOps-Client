import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { IClient, ICreateClient, IUpdateClient, LightWieghtClient } from '../../model/client/client';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private endpoint = 'client'
  constructor(private api: ApiService) { }

  getAll(): Observable<LightWieghtClient[]> {
    return this.api.get<LightWieghtClient[]>(`${this.endpoint}`)
  }

  getById(id: number): Observable<IClient> {
    return this.api.get<IClient>(`${this.endpoint}/${id}`);
  }

  add(client: ICreateClient): Observable<IClient>{
    return this.api.post<IClient>(`${this.endpoint}`, client)
  }

  update(clientId: number, updateClient: IUpdateClient): Observable<IClient> {
    return this.api.put<IClient>(`${this.endpoint}/${clientId}`, updateClient);
  }

  delete(clientId: number): Observable<boolean> {
    return this.api.delete<boolean>(`${this.endpoint}/${clientId}`);
  }
}
