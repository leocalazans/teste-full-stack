// clinic.store.ts
import { Injectable, signal, computed } from '@angular/core';
import { Clinic } from './clinicas.model';

@Injectable({ providedIn: 'root' })
export class clinicasStore {
  // Estado global
  private _clinics = signal<Clinic[]>([]);
  private _selectedClinic = signal<Clinic | null>(null);

  // Computados (derivados)
  clinics = computed(() => this._clinics());
  selectedClinic = computed(() => this._selectedClinic());

  setClinics(clinics: Clinic[]) {
    this._clinics.set(clinics);
  }

  selectClinic(clinic: Clinic) {
    this._selectedClinic.set(clinic);
  }

  clearSelectedClinic() {
    this._selectedClinic.set(null);
  }

  addClinic(newClinic: Clinic) {
    this._clinics.update((current) => [...current, newClinic]);
  }
}
