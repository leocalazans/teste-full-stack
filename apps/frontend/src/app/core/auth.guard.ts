import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../features/auth/auth.service';
import { catchError, map, take } from 'rxjs/operators';
import { of, Observable } from 'rxjs';


/**
 * Functional Guard que verifica o status de autenticação.
 * Refatorado para 'export function' (função nomeada) em vez de 'export const'
 * para resolver o problema de 'Cannot access before initialization' no ambiente de testes.
 */
export function AuthGuard(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.currentUser$.pipe(
    take(1),
    map(user => {
      // Se o usuário existir, permite a navegação
      if (user) {
        return true;
      }
      // Se não houver usuário, redireciona para a rota de login ('/')
      return router.parseUrl('/');
    }),
    // Captura erros no fluxo do observable e garante o redirecionamento
    catchError(() => of(router.parseUrl('/')))
  );
};
