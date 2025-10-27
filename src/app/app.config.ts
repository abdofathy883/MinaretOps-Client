import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import {
  provideServiceWorker,
  ServiceWorkerModule,
} from '@angular/service-worker';
import { environment } from '../environments/environment';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    ...(LoggerModule.forRoot({
      level: NgxLoggerLevel.DEBUG,          // console level
      serverLogLevel: NgxLoggerLevel.ERROR, // logs sent to backend
      serverLoggingUrl: '/api/logs'         // your Serilog API endpoint
    }).providers ?? []),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    importProvidersFrom(
      ServiceWorkerModule.register('service-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000',
      })
    ),
  ],
};
