import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../services/api-service/api.service';
import { Observable } from 'rxjs';
import { ILoginLog } from '../interfaces/i-login-log';

@Injectable({
  providedIn: 'root'
})
export class LoginLogService {
  private endpoint: string = 'auth';
  private api = inject(ApiService);

  getAllLogs(): Observable<ILoginLog[]> {
    return this.api.get<ILoginLog[]>(`${this.endpoint}/logs`);
  }
}
