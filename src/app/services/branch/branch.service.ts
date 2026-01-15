import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api-service/api.service';
import { IBranch, ICreateBranch, IUpdateBranch } from '../../model/branch/i-branch';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private readonly endpoint = 'branch';

  constructor(private api: ApiService){}

  getAll(): Observable<IBranch[]> {
    return this.api.get<IBranch[]>(this.endpoint);
  }

  getById(id: number): Observable<IBranch> {
    return this.api.get<IBranch>(`${this.endpoint}/${id}`);
  }

  create(branch: ICreateBranch): Observable<IBranch> {
    return this.api.post<IBranch>(this.endpoint, branch);
  }

  update(id: number, branch: IUpdateBranch): Observable<IBranch> {
    return this.api.put<IBranch>(`${this.endpoint}/${id}`, branch);
  }

  delete(id: number): Observable<boolean> {
    return this.api.delete<boolean>(`${this.endpoint}/${id}`);
  }
}
