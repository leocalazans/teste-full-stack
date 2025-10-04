import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ClinicasService } from './clinicas.service';

export interface Clinic {
  id?: string;
  corporateName: string;
  fantasyName: string;
  cnpj: string;
  regional: string;
  inaugurationDate: string | null;
  specialties: string[];
  isActive: boolean;
}

export const clinicaResolver: ResolveFn<any> = (route) => {
  const service = inject(ClinicasService);
  const id = route.paramMap.get('id')!;
  return service.getClinicById(id); // retorna Observable
};
