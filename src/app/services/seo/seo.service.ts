import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { ICreateSeo, ISeo } from '../../model/seo/i-seo';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private endpoint: string = 'seo';
  constructor(private api: ApiService) { }

  getSeoContent(lang: string, pageRoute: string): Observable<ISeo> {
    return this.api.get<ISeo>(`${this.endpoint}/${lang}/${pageRoute}`);
  }

  saveNewSeo(seoData: ICreateSeo): Observable<ISeo> {
    const formData = new FormData();
    formData.append('route', seoData.route);
    formData.append('language', seoData.language);
    if (seoData.title) formData.append('title', seoData.title);
    if (seoData.description) formData.append('description', seoData.description);
    if (seoData.keywords) formData.append('keywords', seoData.keywords);
    if (seoData.ogTitle) formData.append('ogTitle', seoData.ogTitle);
    if (seoData.ogImage) formData.append('ogImage', seoData.ogImage);
    if (seoData.canonicalUrl) formData.append('canonicalUrl', seoData.canonicalUrl);
    if (seoData.robots) formData.append('robots', seoData.robots);
    return this.api.post<ISeo>(this.endpoint, formData);
  }
}
