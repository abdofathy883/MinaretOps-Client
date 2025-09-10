import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { IComplaint, ICreateComplaint } from '../../model/complaints/i-complaint';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private endpoint = 'complaint';
  constructor(private api: ApiService) { }

  getAll(): Observable<IComplaint[]> {
    return this.api.get<IComplaint[]>(this.endpoint);
  }

  create(complaint: ICreateComplaint) : Observable<ICreateComplaint> {
    return this.api.post<ICreateComplaint>(this.endpoint, complaint);
  }
}
