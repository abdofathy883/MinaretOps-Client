import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private readonly VAPID_PUBLIC_KEY = 'BOH45F9SMmTBd36rP1RjvTiF8exlo94NFzd7IALtvmstr5IYXmfDho65NW4JZb5O20o8wOUK-l8Tdtm32ZwzgIs';
  private currentUserId: string | null = null;

  public notificationSubject = new BehaviorSubject<any>(null);

  constructor(private swPush: SwPush, private http: HttpClient) { 
    this.setupNotificationHandling();
  }

  async subscribeToNotifications(userId: string): Promise<boolean> {
    this.currentUserId = userId;
    
    if (!this.swPush.isEnabled) {
      console.log('Push notifications not enabled');
      return false;
    }

    try {
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });

      // Send subscription to backend
      await this.http.post('/api/pushsubscription/subscribe', {
        userId: userId,
        endpoint: subscription.endpoint,
        keys: subscription.getKey('p256dh') && subscription.getKey('auth') ? {
          p256dh: subscription.getKey('p256dh'),
          auth: subscription.getKey('auth')
        } : null
      }).toPromise();

      console.log('Successfully subscribed to push notifications');
      return true;
    } catch (err) {
      console.error('Could not subscribe to notifications', err);
      return false;
    }
  }

  private setupNotificationHandling() {
    // Handle incoming notifications
    this.swPush.messages.subscribe((message: any) => {
      console.log('Received push message:', message);
      
      // Play notification sound
      this.playNotificationSound();
      
      // Show notification
      this.showNotification(message.notification);
      
      // Emit to subscribers
      this.notificationSubject.next(message);
    });

    // Handle notification clicks
    this.swPush.notificationClicks.subscribe((event: any) => {
      console.log('Notification clicked:', event);
      
      // Navigate to the URL if provided
      if (event.notification.data && event.notification.data.url) {
        window.open(event.notification.data.url, '_blank');
      }
    });
  }

  private playNotificationSound() {
    // Create and play notification sound
    const audio = new Audio('assets/sounds/notification.mp3'); // Add your notification sound file
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Could not play notification sound:', err));
  }

  private showNotification(notification: any) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: 'assets/icons/icon-192x192.png',
        badge: 'assets/icons/icon-72x72.jpg',
        tag: 'announcement',
        requireInteraction: true,
        silent: false
      });
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async unsubscribeFromNotifications(): Promise<void> {
    if (this.currentUserId) {
      await this.http.delete(`/api/pushsubscription/unsubscribe/${this.currentUserId}`).toPromise();
    }
  }
}
