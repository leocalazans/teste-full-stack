import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../app.config';
import { Clinic } from './clinic.model';

@Injectable({ providedIn: 'root' })
export class ClinicService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  list(): Observable<Clinic[]> {
    return this.http.get<Clinic[]>(`${this.baseUrl}/clinics`, { withCredentials: true });
  }

  create(data: Partial<Clinic>): Observable<Clinic> {
    return this.http.post<Clinic>(`${this.baseUrl}/clinics`, data, { withCredentials: true });
  }

  update(id: number, data: Partial<Clinic>): Observable<Clinic> {
    return this.http.put<Clinic>(`${this.baseUrl}/clinics/${id}`, data, { withCredentials: true });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clinics/${id}`, { withCredentials: true });
  }
}
