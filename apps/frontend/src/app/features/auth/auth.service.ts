// src/app/features/auth/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay, switchMap, tap, catchError } from 'rxjs/operators';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
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

  /** login + fetch profile */
  login(email: string, password: string) {
    // First ensure the CSRF cookie is set (server will set XSRF-TOKEN), then POST login
    return this.http.get(`${this.baseUrl}/csrf-cookie`, { withCredentials: true }).pipe(
      switchMap(() => this.http.post(`${this.baseUrl}/auth/login`, { email, password }, { withCredentials: true })),
      switchMap(() => this.fetchProfile()),
      tap(user => this.currentUserSubject.next(user)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /** busca o usuário logado via cookie */
  fetchProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/me`, { withCredentials: true }).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(err => {
        // surface status for debugging
        console.error('fetchProfile failed', err?.status, err);
        this.currentUserSubject.next(null);
        return throwError(() => err);
      })
    );
  }

  /** logout limpa a sessão no backend e no front */
  logout() {
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.currentUserSubject.next(null)),
      catchError(err => this.handleError(err))
    );
  }

  /** tratamento centralizado de erros */
  private handleError(err: any) {
    const message = err?.error?.message ?? 'Ocorreu um erro inesperado. Tente novamente.';
    return throwError(() => new Error(message));
  }
}
