import { Injectable } from '@angular/core';
import { ApiService } from '../api-service/api.service';
import { Observable } from 'rxjs';
import { IBlog, IBlogCategory, ICreateBlog, ICreateBlogCategory } from '../../model/blog/i-blog';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private endpoint = 'blog';
  constructor(private api: ApiService) { }

  getAllBlogs(): Observable<IBlog[]> {
    return this.api.get<IBlog[]>(this.endpoint);
  }

  getAllCategories() : Observable<IBlogCategory[]> {
    return this.api.get<IBlogCategory[]>(`${this.endpoint}`)
  }

  getByTitle(title: string): Observable<IBlog> {
    return this.api.get<IBlog>(`${this.endpoint}/${title}`);
  }

  createBlog(post: ICreateBlog): Observable<IBlog> {
    return this.api.post<IBlog>(this.endpoint, post);
  }

  createCategory(cat: ICreateBlogCategory): Observable<IBlogCategory> {
    return this.api.post<IBlogCategory>(`${this.endpoint}/add-category`, cat);
  }
}
