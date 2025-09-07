import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Announcement, CreateAnnouncement } from '../../model/announcement/announcement';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private endpoint = 'announcement'
  constructor(private api: ApiService) { }

  create(announcement: CreateAnnouncement): Observable<Announcement> {
    return this.api.post<Announcement>(this.endpoint, announcement);
  }

  getAll(): Observable<Announcement[]> {
    return this.api.get<Announcement[]>(this.endpoint);
  }
}
