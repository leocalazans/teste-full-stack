import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, User } from './auth.service';
import { API_BASE_URL } from '../../app.config';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { throwError } from 'rxjs';

// --- Constantes de Mock ---
const MOCK_BASE_URL = 'http://api.test';
const MOCK_USER: User = { id: 'u123', name: 'Mock User', email: 'test@example.com' };
const LOGIN_PAYLOAD = { email: 'test@example.com', password: 'password' };
const CSRF_URL = `${MOCK_BASE_URL}/csrf-cookie`;
const LOGIN_URL = `${MOCK_BASE_URL}/auth/login`;
const PROFILE_URL = `${MOCK_BASE_URL}/auth/me`;
const LOGOUT_URL = `${MOCK_BASE_URL}/auth/logout`;

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        // Fornece a base URL para a injeção
        { provide: API_BASE_URL, useValue: MOCK_BASE_URL }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Garante que não haja requisições pendentes após cada teste
    httpMock.verify();
  });

  // --- Teste de Estado Inicial ---
  it('should be created and currentUser$ should initially emit null', (done) => {
    expect(service).toBeTruthy();
    service.currentUser$.pipe(take(1)).subscribe(user => {
      expect(user).toBeNull();
      done();
    });
  });

  // ----------------------------------------------------------------------
  // --- fetchProfile() Tests (Método auxiliar e usado pelo AppInitializer) ---
  // ----------------------------------------------------------------------

  describe('fetchProfile', () => {
    it('should fetch the profile, update the user state, and return the user', (done) => {
      // 1. Assina para verificar o estado atualizado
      service.currentUser$.pipe(take(2)).subscribe({
        next: (user) => {
          if (!user) return; // Ignore a emissão inicial null

          // 3. Verifica se o estado do usuário foi atualizado pelo 'tap'
          expect(user).toEqual(MOCK_USER);
          done();
        }
      });

      // 2. Chama o método fetchProfile
      service.fetchProfile().subscribe(user => {
        // Verifica o valor retornado pelo observable
        expect(user).toEqual(MOCK_USER);
      });

      // 4. Simula a resposta HTTP para o endpoint 'me'
      const req = httpMock.expectOne(PROFILE_URL);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBeTrue();
      req.flush(MOCK_USER);
    });

    it('should handle fetchProfile error, clear the user state, and throw an error', (done) => {
      // 1. Define um usuário prévio para garantir que ele seja limpo
      (service as any).currentUserSubject.next(MOCK_USER);
      spyOn(console, 'error'); // Espiona o console para evitar log durante o teste

      // 2. Chama fetchProfile e espera que ele propague o erro
      service.fetchProfile().subscribe({
        next: () => fail('expected an error, but got a user'),
        error: (error) => {
          // 3. Verifica se o estado do usuário foi limpo (null)
          service.currentUser$.pipe(take(1)).subscribe(user => {
            expect(user).toBeNull();
            // Verifica se o erro foi propagado
            expect(error instanceof HttpErrorResponse).toBeTrue();
            done();
          });
        }
      });

      // 4. Simula a resposta HTTP de erro
      const req = httpMock.expectOne(PROFILE_URL);
      expect(req.request.method).toBe('GET');
      req.error(new ProgressEvent('HTTP Error'), { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ------------------------------------
  // --- login() Tests ---
  // ------------------------------------

  describe('login', () => {
    it('should execute CSRF -> LOGIN -> PROFILE and update user state on success', (done) => {
      // Variável para rastrear o estado do usuário
      let userState: User | null = null;
      service.currentUser$.subscribe(user => {
        userState = user;
      });

      // 1. Chama o método de login
      service.login(LOGIN_PAYLOAD.email, LOGIN_PAYLOAD.password).subscribe(user => {
        // Verifica o valor retornado pelo observable
        expect(user).toEqual(MOCK_USER);
        done();
      });

      // 2. Simula a resposta do CSRF (GET)
      const csrfReq = httpMock.expectOne(CSRF_URL);
      expect(csrfReq.request.method).toBe('GET');
      csrfReq.flush({}); // Resposta de sucesso

      // 3. Simula a resposta do LOGIN (POST)
      const loginReq = httpMock.expectOne(LOGIN_URL);
      expect(loginReq.request.method).toBe('POST');
      expect(loginReq.request.body).toEqual(LOGIN_PAYLOAD);
      loginReq.flush({}); // Resposta de sucesso

      // 4. Simula a resposta do PROFILE (GET)
      const profileReq = httpMock.expectOne(PROFILE_URL);
      expect(profileReq.request.method).toBe('GET');
      profileReq.flush(MOCK_USER);

      // 5. Verifica se o estado do usuário foi atualizado pelo 'tap' no login
      expect(userState as unknown as User).toEqual(MOCK_USER);
    });

    it('should fail and propagate error if CSRF request fails', (done) => {
      service.login(LOGIN_PAYLOAD.email, LOGIN_PAYLOAD.password).subscribe({
        next: () => fail('should have failed'),
        error: (err) => {
          expect(err instanceof Error).toBeTrue(); // Verifica se handleError foi chamado
          expect(err.message).toBe('Ocorreu um erro inesperado. Tente novamente.');
          done();
        }
      });

      // Simula a falha do CSRF
      const csrfReq = httpMock.expectOne(CSRF_URL);
      csrfReq.error(new ProgressEvent('CSRF Error'), { status: 500 });

      // Garante que nenhuma outra requisição foi feita
      httpMock.expectNone(LOGIN_URL);
      httpMock.expectNone(PROFILE_URL);
    });
  });

  // ------------------------------------
  // --- logout() Tests ---
  // ------------------------------------

  describe('logout', () => {
    beforeEach(() => {
      // Define um usuário para que o logout o limpe
      (service as any).currentUserSubject.next(MOCK_USER);
    });

    it('should call logout endpoint and clear the user state on success', (done) => {
      // 1. Assina para verificar o estado limpo
      service.currentUser$.pipe(take(2)).subscribe({
        next: (user) => {
          // A segunda emissão deve ser null (a primeira é MOCK_USER)
          if (user === MOCK_USER) return;

          expect(user).toBeNull();
          done();
        }
      });

      // 2. Chama o método de logout
      service.logout().subscribe();

      // 3. Simula a resposta HTTP para o endpoint de logout
      const req = httpMock.expectOne(LOGOUT_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();
      req.flush({});
    });

    it('should handle error during logout and propagate generic message', (done) => {
      spyOn(console, 'error'); // Espiona o console para evitar log

      service.logout().subscribe({
        next: () => fail('should have failed'),
        error: (err) => {
          // Mesmo com erro, o estado do usuário deve ser mantido
          service.currentUser$.pipe(take(1)).subscribe(user => {
            expect(user).toEqual(MOCK_USER);
          });

          // Verifica se o erro foi tratado e propagado com a mensagem de erro padrão
          expect(err instanceof Error).toBeTrue();
          expect(err.message).toBe('Ocorreu um erro inesperado. Tente novamente.');
          done();
        }
      });

      // Simula a falha do logout
      const req = httpMock.expectOne(LOGOUT_URL);
      req.error(new ProgressEvent('Logout Error'), { status: 500 });
    });
  });
});
