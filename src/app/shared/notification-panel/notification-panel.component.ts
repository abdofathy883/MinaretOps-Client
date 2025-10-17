import { Component, OnInit } from '@angular/core';
import { PushNotificationService } from '../../services/push-notification/push-notification.service';

@Component({
  selector: 'app-notification-panel',
  imports: [],
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.css'
})
export class NotificationPanelComponent implements OnInit{
  notifications: any[] = [];

  constructor(private pushNotificationService: PushNotificationService) {}

  ngOnInit() {
    // Subscribe to new notifications
    this.pushNotificationService.notificationSubject.subscribe(notification => {
      if (notification) {
        this.notifications.unshift(notification);
      }
    });
  }
}
