import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { IEntry } from '../../model/contact/i-entry';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private endpoint: string = 'contactform';
  constructor(private api: ApiService) {}

  getAll(): Observable<IEntry[]> {
    return this.api.get<IEntry[]>(this.endpoint);
  }

  getById(id: number): Observable<IEntry> {
    return this.api.get<IEntry>(`${this.endpoint}/${id}`);
  }
}
