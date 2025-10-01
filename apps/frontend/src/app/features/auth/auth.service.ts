// src/app/features/auth/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay, switchMap, tap } from 'rxjs/operators';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { API_BASE_URL } from '../../app.config';

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(email: string, password: string) {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password }, { withCredentials: true }).pipe(
      // withCredentials:true => browser will accept cookies set by server (HttpOnly cookie)
      switchMap(() => this.fetchProfile()), // after login, get profile
      tap(user => this.currentUserSubject.next(user)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  fetchProfile(): Observable<User> {
    return this.http.get<User>('/api/auth/me', { withCredentials: true });
  }

  logout() {
    return this.http.post('/api/auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => this.currentUserSubject.next(null))
    );
  }
}
