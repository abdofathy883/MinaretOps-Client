import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnnouncementService } from '../../../services/announcements/announcement.service';
import { Announcement } from '../../../model/announcement/announcement';

@Component({
  selector: 'app-all-announcements',
  imports: [CommonModule],
  templateUrl: './all-announcements.component.html',
  styleUrl: './all-announcements.component.css',
})
export class AllAnnouncementsComponent implements OnInit {
  announcements: Announcement[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private announcementService: AnnouncementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.announcementService.getAll().subscribe({
      next: (response) => {
        this.announcements = response;
        this.isLoading = false;
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
      return announcementDate.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  getTimeAgo(date: Date): string {
    const announcementDate = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - announcementDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'الآن';
    } else if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else if (diffInDays < 7) {
      return `منذ ${diffInDays} يوم`;
    } else {
      return announcementDate.toLocaleDateString('ar-SA', {
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
}
