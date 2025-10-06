import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../app.config';
import { Clinic, Region, Specialty } from './clinicas.model';

@Injectable({ providedIn: 'root' })
export class ClinicasService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  list(): Observable<Clinic[]> {
    return this.http.get<Clinic[]>(`${this.baseUrl}/clinics`, { withCredentials: true });
  }

  create(data: Partial<Clinic>): Observable<Clinic> {
    return this.http.post<Clinic>(`${this.baseUrl}/clinics`, data, { withCredentials: true });
  }

  update(id: string, data: Partial<Clinic>): Observable<Clinic> {
    return this.http.put<Clinic>(`${this.baseUrl}/clinics/${id}`, data, { withCredentials: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clinics/${id}`, { withCredentials: true });
  }

  getClinicById(id: string): Observable<Clinic> {
    return this.http.get<Clinic>(`${this.baseUrl}/clinics/${id}`, { withCredentials: true });
  }

  getRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(`${this.baseUrl}/regions`, { withCredentials: true });
  }

  getSpecialties(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(`${this.baseUrl}/specialties`, { withCredentials: true });
  }
}

