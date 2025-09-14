import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private endpoint = 'logging'
  constructor(private api: ApiService) { }

  log(level: string, message: string, data?: any) {
    return this.api.post(`${this.endpoint}/logs`, { level, message, data })
      .pipe(
        catchError(error => {
          console.error('Failed to send log to backend:', error);
          return of(null);
        })
      )
      .subscribe();
  }
}
