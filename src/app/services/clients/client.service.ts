import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { ClientDTO, CreateClient, LightWieghtClient, UpdateClientDTO } from '../../model/client/client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private endpoint = 'client'
  constructor(private api: ApiService) { }

  getAll(): Observable<LightWieghtClient[]> {
    return this.api.get<LightWieghtClient[]>(`${this.endpoint}`)
  }

  getById(id: number): Observable<ClientDTO> {
    return this.api.get<ClientDTO>(`${this.endpoint}/${id}`);
  }

  add(client: CreateClient): Observable<ClientDTO>{
    return this.api.post<ClientDTO>(`${this.endpoint}`, client)
  }

  update(clientId: number, updateClient: UpdateClientDTO): Observable<ClientDTO> {
    return this.api.put<ClientDTO>(`${this.endpoint}/${clientId}`, updateClient);
  }
}
