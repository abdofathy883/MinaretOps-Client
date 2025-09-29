import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { from, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FingerPrientService {
  private fpPromise: Promise<any> | null = null;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Only load FingerprintJS in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.fpPromise = FingerprintJS.load(/* { apiKey: environment.fpApiKey } for Pro */);
    }
  }

  // Observable version (good for RxJS pipelines)
  getVisitorId$(): Observable<string> {
    if (!this.fpPromise) {
      return of('unknown'); // or throw
    }
    return from(this.fpPromise).pipe(
      switchMap(fp => from(fp.get())),
      map((result: any) => result.visitorId)
    );
  }

  async getOrCreateDeviceId(): Promise<string> {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Fingerprint service: not running in browser');
    }

    const stored = localStorage.getItem('device_id');
    if (stored) return stored;

    if (!this.fpPromise) throw new Error('Fingerprint not initialized');

    const fp = await this.fpPromise;
    const result = await fp.get();
    const visitorId = result.visitorId as string;

    // Persist for resilience against identical fingerprints or future changes
    localStorage.setItem('device_id', visitorId);
    return visitorId;
  }
}
