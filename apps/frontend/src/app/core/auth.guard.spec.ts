import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'; // Adicionado ActivatedRouteSnapshot, RouterStateSnapshot
import { of, Observable } from 'rxjs'; // Adicionado Observable para tipagem clara
import { catchError } from 'rxjs/operators';
import { AuthGuard } from './auth.guard';
import { AuthService, User } from '../features/auth/auth.service';

// Mock do AuthService
const mockUser: User = { id: '1', name: 'Test', email: 't@example.com' } as User;
const mockAuthServiceWithUser = { currentUser$: of(mockUser) };
const mockAuthServiceWithoutUser = { currentUser$: of(null) };
// Cria um Observable que simula um erro para testar o catchError
const mockAuthServiceWithError = {
  currentUser$: new Observable<User | null>(observer => {
    observer.error(new Error('Auth Error'));
  }).pipe(catchError(() => of(null)))
};

// Mocks para os argumentos obrigatórios do Functional Guard
const mockRoute = {} as ActivatedRouteSnapshot;
const mockState = {} as RouterStateSnapshot;

describe('AuthGuard (Functional)', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // 1. Cria o Spy para o Router e simula o parseUrl para retornar um objeto UrlTree
    routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    routerSpy.parseUrl.and.callFake((url: string) => new UrlTree());
  });

  it('deve permitir a ativação (return true) quando o usuário está autenticado', (done) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuthServiceWithUser }
      ]
    });

    // 2. Chama a função de guarda com os argumentos mockados (resolve o erro 2554)
    const result = TestBed.runInInjectionContext(() => AuthGuard(mockRoute, mockState));

    // 3. Tipagem explícita para 'res' e conversão para Observable (resolve os erros de 'subscribe' e 'implicit any')
    (result as Observable<boolean | UrlTree>).subscribe((res: boolean | UrlTree) => {
      expect(res).toBeTrue();
      expect(routerSpy.parseUrl).not.toHaveBeenCalled();
      done();
    });
  });

  it('deve redirecionar (return UrlTree) quando o usuário NÃO está autenticado', (done) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuthServiceWithoutUser }
      ]
    });

    // Chama a função de guarda com os argumentos mockados
    const result = TestBed.runInInjectionContext(() => AuthGuard(mockRoute, mockState));

    // Tipagem explícita e conversão
    (result as Observable<boolean | UrlTree>).subscribe((res: boolean | UrlTree) => {
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/');
      expect(res instanceof UrlTree).toBeTrue();
      done();
    });
  });

  it('deve redirecionar (return UrlTree) em caso de erro no stream de autenticação', (done) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuthServiceWithError }
      ]
    });

    // Chama a função de guarda com os argumentos mockados
    const result = TestBed.runInInjectionContext(() => AuthGuard(mockRoute, mockState));

    // Tipagem explícita e conversão
    (result as Observable<boolean | UrlTree>).subscribe((res: boolean | UrlTree) => {
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/');
      expect(res instanceof UrlTree).toBeTrue();
      done();
    });
  });
});
