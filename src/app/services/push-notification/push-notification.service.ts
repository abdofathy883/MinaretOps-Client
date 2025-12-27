import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../api-service/api.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private readonly VAPID_PUBLIC_KEY = 'BOH45F9SMmTBd36rP1RjvTiF8exlo94NFzd7IALtvmstr5IYXmfDho65NW4JZb5O20o8wOUK-l8Tdtm32ZwzgIs';
  private currentUserId: string | null = null;

  public notificationSubject = new BehaviorSubject<any>(null);

  constructor(private swPush: SwPush, private http: HttpClient, private api: ApiService) { 
    this.setupNotificationHandling();
  }

  // Add this helper method to convert ArrayBuffer to base64url
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Add this helper method to convert ArrayBuffer to base64url string
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
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

      // Get keys as ArrayBuffers and convert to base64url strings
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');

      if (!p256dhKey || !authKey) {
        console.error('Subscription keys are missing');
        return false;
      }

      // Send subscription to backend
      await this.api.post('pushsubscription/subscribe', {
        userId: userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(p256dhKey),
          auth: this.arrayBufferToBase64(authKey)
        }
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
