import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
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

    // Wait for service worker to be ready
    private async waitForServiceWorkerReady(timeout: number = 10000): Promise<boolean> {
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        if (this.swPush.isEnabled) {
          // Service worker is enabled, try to access subscription to verify it's ready
          try {
            // Check subscription observable - if SW is ready, this won't throw
            const subscription = await firstValueFrom(this.swPush.subscription);
            console.log('Service Worker is ready');
            return true;
          } catch (err) {
            // SW might not be fully ready yet
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return this.swPush.isEnabled;
    }

  // async subscribeToNotifications(userId: string): Promise<boolean> {
  //   console.log('=== Push Notification Subscription Start ===');
  //   console.log('User ID:', userId);
  //   this.currentUserId = userId;

  //   // Check service worker status
  //   console.log('Service Worker Enabled:', this.swPush.isEnabled);
  //   console.log('Service Worker Registration:', this.swPush.subscription);


  //   if (!this.swPush.isEnabled) {
  //     console.error('❌ Push notifications not enabled - Service Worker is not active');
  //     console.log('Please check:');
  //     console.log('1. Is the app running in production mode or service worker enabled?');
  //     console.log('2. Check browser DevTools > Application > Service Workers');
  //     console.log('3. Hard refresh the page (Ctrl+Shift+R)');
  //     return false;
  //   }

  //   if (!this.swPush.isEnabled) {
  //     console.log('Push notifications not enabled');
  //     return false;
  //   }

  //   try {
  //     console.log('Requesting push subscription...');
  //     const subscription = await this.swPush.requestSubscription({
  //       serverPublicKey: this.VAPID_PUBLIC_KEY
  //     });

  //     console.log('✅ Push subscription obtained');
  //     console.log('Endpoint:', subscription.endpoint);

  //     // Get keys as ArrayBuffers and convert to base64url strings
  //     const p256dhKey = subscription.getKey('p256dh');
  //     const authKey = subscription.getKey('auth');

  //     if (!p256dhKey || !authKey) {
  //       console.error('Subscription keys are missing');
  //       return false;
  //     }

  //     const p256dhString = this.arrayBufferToBase64(p256dhKey);
  //     const authString = this.arrayBufferToBase64(authKey);

  //     console.log('Keys encoded successfully');
  //     console.log('P256DH length:', p256dhString.length);
  //     console.log('Auth length:', authString.length);

  //     // Send subscription to backend
  //     await this.api.post('pushsubscription/subscribe', {
  //       userId: userId,
  //       endpoint: subscription.endpoint,
  //       keys: {
  //         p256dh: this.arrayBufferToBase64(p256dhKey),
  //         auth: this.arrayBufferToBase64(authKey)
  //       }
  //     }).toPromise();

  //     console.log('Successfully subscribed to push notifications');
  //     return true;
  //   } catch (err) {
  //     console.error('Could not subscribe to notifications', err);
  //     return false;
  //   }
  // }

  async subscribeToNotifications(userId: string): Promise<boolean> {
    // debugger;
    console.log('=== Push Notification Subscription Start ===');
    console.log('User ID:', userId);
    
    this.currentUserId = userId;

    if (Notification.permission === 'default') {
      const granted = await this.requestNotificationPermission();
      if (!granted) {
        console.error('❌ Notification permission denied via prompt');
        return false;
      }
    }

    if (Notification.permission !== 'granted') {
      console.error('❌ Notification permission not granted. Current permission:', Notification.permission);
      return false;
    }

    // Wait for service worker to be ready
    console.log('Waiting for service worker to be ready...');
    const isReady = await this.waitForServiceWorkerReady();
    
    if (!isReady) {
      console.error('❌ Service Worker is not enabled or not ready');
      return false;
    }
    
    // Check service worker status
    console.log('Service Worker Enabled:', this.swPush.isEnabled);
    
    if (!this.swPush.isEnabled) {
      console.error('❌ Push notifications not enabled - Service Worker is not active');
      console.log('Please check:');
      console.log('1. Is the app running in production mode or service worker enabled?');
      console.log('2. Check browser DevTools > Application > Service Workers');
      console.log('3. Hard refresh the page (Ctrl+Shift+R)');
      return false;
    }

    try {
      console.log('Requesting push subscription...');
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      });

      console.log('✅ Push subscription obtained');
      console.log('Endpoint:', subscription.endpoint);

      // Get keys as ArrayBuffers and convert to base64url strings
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');

      if (!p256dhKey || !authKey) {
        console.error('❌ Subscription keys are missing');
        return false;
      }

      const p256dhString = this.arrayBufferToBase64(p256dhKey);
      const authString = this.arrayBufferToBase64(authKey);

      console.log('Keys encoded successfully');
      console.log('P256DH length:', p256dhString.length);
      console.log('Auth length:', authString.length);

      // Prepare subscription data
      const subscriptionData = {
        userId: userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: p256dhString,
          auth: authString
        }
      };

      console.log('Sending subscription to backend...');
      console.log('Endpoint URL: pushsubscription/subscribe');
      console.log('Data:', { ...subscriptionData, keys: { p256dh: '***', auth: '***' } });

      // Use firstValueFrom instead of deprecated toPromise()
      await firstValueFrom(
        this.api.post('pushsubscription/subscribe', subscriptionData)
      );

      console.log('✅ Successfully subscribed to push notifications');
      console.log('=== Push Notification Subscription Complete ===');
      return true;
    } catch (err: any) {
      console.error('❌ Could not subscribe to notifications', err);
      
      // More detailed error logging
      if (err.error) {
        console.error('Error details:', err.error);
      }
      if (err.message) {
        console.error('Error message:', err.message);
      }
      if (err.status) {
        console.error('HTTP Status:', err.status);
      }
      if (err.statusText) {
        console.error('HTTP Status Text:', err.statusText);
      }
      
      console.log('=== Push Notification Subscription Failed ===');
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
