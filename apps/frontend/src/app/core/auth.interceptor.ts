// src/app/core/auth.interceptor.ts
import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { catchError, switchMap, throwError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private http = inject(HttpClient);

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError(err => {
        if (err.status === 401 && !req.url.endsWith('/auth/refresh')) {
          // try refresh
          return this.http.post('/api/auth/refresh', {}, { withCredentials: true }).pipe(
            switchMap(() => {
              // resend the original request but ensure credentials are included so cookies are sent
              const retryReq = req.clone({ withCredentials: true });
              return next.handle(retryReq);
            }),
            catchError(e => {
              // final failure: force logout or redirect to login
              return throwError(() => e);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}

// provider to add in app.config or in a core module providers array
export const authInterceptorProvider = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];
