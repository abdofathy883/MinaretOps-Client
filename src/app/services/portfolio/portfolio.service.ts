import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private endpoint = '';
  constructor(private api: ApiService) { }
}
