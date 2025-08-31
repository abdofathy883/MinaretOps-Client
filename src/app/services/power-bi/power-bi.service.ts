import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';

@Injectable({
  providedIn: 'root'
})
export class PowerBIService {
  private endpoint: string = 'powerbi';
  constructor(private api: ApiService) { }

  getEmbedConfig() {
    return this.api.get<any>(`${this.endpoint}`);
  }
}
