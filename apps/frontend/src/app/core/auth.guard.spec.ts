import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import { AuthGuard } from './auth.guard';
import { AuthService, User } from '../features/auth/auth.service';

// --- Mocks ---

// Mock para o User
const mockUser: User = { id: 'user-1', name: 'Test User', email: 'test@app.com' };

// Mock do AuthService usando getter (forma recomendada)
class MockAuthService {
  private _subject = new BehaviorSubject<User | null>(null);

  // Getter que expõe o observable sem permitir mutação externa
  get currentUser$(): Observable<User | null> {
    return this._subject.asObservable();
  }

  loginUser(user: User | null): void {
    this._subject.next(user);
  }
}

// Mock do Router
class MockRouter {
  parseUrl(url: string): UrlTree {
    // Retorna um objeto simplificado que simula o UrlTree
    return ({ path: url } as unknown) as UrlTree;
  }
}

describe('AuthGuard', () => {
  let authService: MockAuthService;
  let router: MockRouter;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRouteSnapshot, useValue: {} },
        { provide: RouterStateSnapshot, useValue: {} }
      ]
    });

    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router) as unknown as MockRouter;
    route = TestBed.inject(ActivatedRouteSnapshot);
    state = TestBed.inject(RouterStateSnapshot);

    // Garante estado inicial limpo
    authService.loginUser(null);
  });

  // --- Cenário 1: Usuário autenticado ---
  it('should return TRUE if the user is logged in', (done) => {
    authService.loginUser(mockUser);

    TestBed.runInInjectionContext(() => {
      (AuthGuard(route, state) as Observable<boolean | UrlTree>)
        .pipe(take(1))
        .subscribe(result => {
          expect(result).toBeTrue();
          done();
        });
    });
  });

  // --- Cenário 2: Usuário não autenticado ---
  it('should return a UrlTree to login (/) if the user is NOT logged in', (done) => {
    authService.loginUser(null);
    const expectedUrlTree = router.parseUrl('/');

    TestBed.runInInjectionContext(() => {
      (AuthGuard(route, state) as Observable<boolean | UrlTree>)
        .pipe(take(1))
        .subscribe(result => {
          expect(result).toEqual(expectedUrlTree);
          done();
        });
    });
  });

  // --- Cenário 3: Erro no stream de autenticação ---
  it('should return a UrlTree to login (/) if the auth stream errors', (done) => {
    // Substitui o Observable por um erro
    spyOnProperty(authService, 'currentUser$', 'get').and.returnValue(
      throwError(() => new Error('Auth stream failed'))
    );

    const expectedUrlTree = router.parseUrl('/');

    TestBed.runInInjectionContext(() => {
      (AuthGuard(route, state) as Observable<boolean | UrlTree>)
        .pipe(take(1))
        .subscribe(result => {
          expect(result).toEqual(expectedUrlTree);
          done();
        });
    });
  });
});
