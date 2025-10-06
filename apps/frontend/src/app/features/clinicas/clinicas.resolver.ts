import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ClinicasService } from './clinicas.service';
import { Clinic } from './clinicas.model';
import { catchError, of } from 'rxjs';

/**
 * Resolve os dados de uma clínica pelo ID antes de carregar o componente,
 * garantindo que a navegação seja segura em caso de dados ausentes ou erros de API.
 */
export const clinicaResolver: ResolveFn<Clinic | null> = (route) => {
  const service = inject(ClinicasService);
  const router = inject(Router);

  const id = route.paramMap.get('id');

  // 1. BRANCH: Trata o caso em que o ID está ausente nos parâmetros da rota.
  if (!id) {
    console.warn('Resolver: ID da clínica ausente na rota. Redirecionando para a lista.');
    router.navigate(['/dashboard/clinicas']);
    return of(null); // Retorna um Observable de null para concluir a ativação da rota.
  }

  // 2. Chama o serviço.
  return service.getClinicById(id).pipe(
    // 3. BRANCH: Trata erros na chamada da API (ex: 404 Not Found)
    catchError((error) => {
      console.error('Resolver: Erro ao carregar clínica, redirecionando.', error);
      router.navigate(['/dashboard/clinicas']);
      return of(null); // Retorna null em caso de erro para não quebrar a aplicação.
    })
  );
};
