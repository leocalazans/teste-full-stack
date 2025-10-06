import { TestBed } from '@angular/core/testing';
import { clinicasStore } from './clinic.store';
import { Clinic } from './clinicas.model';

describe('clinicasStore', () => {
  let store: clinicasStore;

  const mockClinics: Clinic[] = [
    { id: '1', corporate_name: 'Clínica Alpha', fantasy_name: 'Alpha', cnpj: '11.111.111/0001-11' } as Clinic,
    { id: '2', corporate_name: 'Clínica Beta', fantasy_name: 'Beta', cnpj: '22.222.222/0001-22' } as Clinic,
  ];

  const newClinic: Clinic = {
    id: '3',
    corporate_name: 'Clínica Gama',
    fantasy_name: 'Gama',
    cnpj: '33.333.333/0001-33'
  } as Clinic;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [clinicasStore],
    });

    store = TestBed.inject(clinicasStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should set clinics list correctly', () => {
    store.setClinics(mockClinics);
    expect(store.clinics()).toEqual(mockClinics);
  });

  it('should select a clinic correctly', () => {
    const clinic = mockClinics[0];
    store.selectClinic(clinic);
    expect(store.selectedClinic()).toEqual(clinic);
  });

  it('should clear selected clinic', () => {
    store.selectClinic(mockClinics[0]);
    store.clearSelectedClinic();
    expect(store.selectedClinic()).toBeNull();
  });

  it('should add a clinic correctly', () => {
    store.setClinics(mockClinics);
    store.addClinic(newClinic);

    const result = store.clinics();
    expect(result.length).toBe(3);
    expect(result[2]).toEqual(newClinic);
  });

  it('should start with empty clinics and null selectedClinic', () => {
    expect(store.clinics()).toEqual([]);
    expect(store.selectedClinic()).toBeNull();
  });
});
