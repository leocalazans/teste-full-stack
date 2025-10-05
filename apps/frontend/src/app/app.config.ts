// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { authInterceptorProvider } from './core/auth.interceptor';
import { routes } from './app.routes';
import { InjectionToken } from '@angular/core';
import { environment } from '../environments/environment';
import { AuthService } from './features/auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiBaseUrl,
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withXsrfConfiguration({
      cookieName: 'XSRF-TOKEN',   // backend must set this cookie (readable by JS)
      headerName: 'X-XSRF-TOKEN'
    })),
    authInterceptorProvider,
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return firstValueFrom(
        auth.fetchProfile().pipe(
          catchError(() => [null]) // substitui erro por null
        )
      );
    })
  ]
};
