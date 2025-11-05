import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { ICompleteInvitation, ICreateInvitation, IInvitation } from '../../model/emp-invitation/i-invitation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpInvitationService {
  private endpoint = 'employeeinvitation';
  constructor(private api: ApiService) {}

  createInvitation(data: ICreateInvitation): Observable<IInvitation> {
    return this.api.post<IInvitation>(`${this.endpoint}/create`, data);
  }

  getPendingInvitations(): Observable<IInvitation[]> {
    return this.api.get<IInvitation[]>(`${this.endpoint}/pending`);
  }

  getInvitationByToken(token: string): Observable<IInvitation> {
    return this.api.get<IInvitation>(`${this.endpoint}/token/${token}`);
  }

  completeInvitation(data: ICompleteInvitation): Observable<IInvitation> {
    return this.api.post<IInvitation>(`${this.endpoint}/complete`, data);
  }

  approveInvitation(id: number): Observable<any> {
    return this.api.post(`${this.endpoint}/approve/${id}`, {});
  }

  cancelInvitation(id: number): Observable<any> {
    return this.api.post(`${this.endpoint}/cancel/${id}`, {});
  }
}
