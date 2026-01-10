import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { IContract, ICreateContract } from '../../model/contract/i-contract';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private endpoint = 'contract';

  constructor(private api: ApiService) {}

  getAll(): Observable<IContract[]> {
    return this.api.get<IContract[]>(this.endpoint);
  }

  getById(id: number): Observable<IContract> {
    return this.api.get<IContract>(`${this.endpoint}/${id}`);
  }

  create(contract: ICreateContract): Observable<IContract> {
    return this.api.post<IContract>(this.endpoint, contract);
  }
}
