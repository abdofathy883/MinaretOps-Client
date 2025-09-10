import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { IContactForm } from '../../model/contact-form/i-contact-form';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private endpoint: string = 'contactform'
  constructor(private api: ApiService) { }

  getAll(): Observable<IContactForm[]> {
    return this.api.get<IContactForm[]>(this.endpoint);
  }

  getById(id: number): Observable<IContactForm> {
    return this.api.get<IContactForm>(`${this.endpoint}/${id}`);
  }
}
