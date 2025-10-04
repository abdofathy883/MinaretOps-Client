import { Component, OnInit } from '@angular/core';
import { IBlog } from '../../../model/blog/i-blog';
import { BlogService } from '../../../services/blog/blog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-blogs',
  imports: [],
  templateUrl: './all-blogs.component.html',
  styleUrl: './all-blogs.component.css',
})
export class AllBlogsComponent implements OnInit {
  posts: IBlog[] = [];

  constructor(
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.blogService.getAllBlogs().subscribe({
      next: (response) => {
        this.posts = response;
      },
    });
  }

  formatDate(date: Date): string {
    const announcementDate = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - announcementDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'اليوم';
    } else if (diffInDays === 1) {
      return 'أمس';
    } else if (diffInDays < 7) {
      return `منذ ${diffInDays} أيام`;
    } else {
      return announcementDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
  goToPost(title: string) {
    this.router.navigate(['blog/', title]);
  }
}
