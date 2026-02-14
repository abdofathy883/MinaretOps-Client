import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private endpoint: string = 'seo';
  constructor(private api: ApiService) { }

  getSeoContent(pageRoute: string) {
    // TODO: Implement actual API call
    return this.api.get(`${this.endpoint}/${pageRoute}`);
  }
}
