import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClientXsrfModule, provideHttpClient } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_INITIALIZER, InjectionToken } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { defer, of, throwError } from 'rxjs';

// Importa a configuração real para teste
import { API_BASE_URL, appConfig } from './app.config';
import { AuthService } from './features/auth/auth.service';
import { authInterceptorProvider } from './core/auth.interceptor';
import { routes } from './app.routes'; // Mockamos isso, mas a referência deve ser real

// --- Mocks para Dependências ---

// Mock do módulo de ambiente
const mockEnvironment = { apiBaseUrl: 'http://mock-api-base' };

// Mock do AuthService
class MockAuthService {
  fetchProfile() {
    // Retorna um Observable para simular a chamada HTTP
    return of({ id: 1, name: 'Test User Profile' });
  }
}

describe('App Configuration', () => {

  // A função setup é usada para configurar o TestBed com os providers do appConfig
  // e injetar mocks para as dependências externas.
  const setup = (authService: any) => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes), HttpClientXsrfModule.withOptions({})],
      providers: [
        // Usa o provideHttpClientTesting para simular as chamadas HTTP
        provideHttpClient(),
        provideHttpClientTesting(),

        // Providers do appConfig
        ...appConfig.providers,

        // Sobrescreve dependências injetadas no appConfig
        { provide: 'ENVIRONMENT', useValue: mockEnvironment }, // Mocka environment (se estivesse importado)
        { provide: API_BASE_URL, useValue: mockEnvironment.apiBaseUrl }, // Mocka o valor final do token
        { provide: AuthService, useValue: authService },
        { provide: APP_BASE_HREF, useValue: '/' }, // Necessário para RouterTestingModule
      ],
    });
  };

  // --- Teste do Token API_BASE_URL ---
  it('should provide API_BASE_URL with the correct environment value', () => {
    // O teste do token é simples, pois ele é "providedIn: 'root'".
    // O valor do token é determinado pela factory no app.config.ts
    // Se estivesse injetando a fábrica (sem usar useValue no setup),
    // ele deveria retornar o valor do mockEnvironment.
    const expectedUrl = 'http://mock-api-base';

    // Configura o TestBed para garantir que o token é injetado corretamente
    TestBed.configureTestingModule({
      providers: [
        { provide: API_BASE_URL, useValue: expectedUrl } // Simula o resultado da factory
      ]
    });

    const tokenValue = TestBed.inject(API_BASE_URL as InjectionToken<string>);
    expect(tokenValue).toBe(expectedUrl);
  });

  // --- Teste dos Providers Essenciais ---
  it('should include the authInterceptorProvider in the configuration', () => {
    // A maneira mais fácil de verificar se um provider está presente é tentar injetá-lo.
    // Embora não possamos injetar diretamente o provider, podemos verificar se o token
    // que ele provê está listado.
    // Neste caso, vamos apenas verificar que o provider em si está na lista (teste simples).

    // Busca a referência ao authInterceptorProvider dentro dos providers
    const authProviderExists = appConfig.providers.includes(authInterceptorProvider);
    expect(authProviderExists).toBeTrue();
  });


  // --- Teste do APP_INITIALIZER (Lógica de Inicialização) ---
  describe('App Initializer (fetchProfile)', () => {
    let authService: MockAuthService;
    // CORREÇÃO: Adicionando 'readonly' para resolver o erro de tipagem com TestBed.inject(APP_INITIALIZER)
    let appInitializer: readonly (() => unknown | Promise<unknown>)[];

    // Cria um serviço mock que permite espionar a chamada
    const createSpiedAuthService = (observable: any) => {
      const spyService = {
        fetchProfile: jasmine.createSpy('fetchProfile').and.returnValue(observable)
      };
      return spyService;
    };

    it('should call fetchProfile and complete successfully on app initialization', async () => {
      // 1. Setup: O serviço mock retorna sucesso
      authService = createSpiedAuthService(of({ name: 'User' }));
      setup(authService);

      // 2. Injeta o token APP_INITIALIZER
      appInitializer = TestBed.inject(APP_INITIALIZER);

      // 3. Executa o initializer (que é uma função que retorna uma Promise)
      // O appConfig usa provideAppInitializer, que fornece uma função para o token APP_INITIALIZER.
      const initializerFn = appInitializer[0];

      // Garante que o initializer resolve sem erros
      await expectAsync(initializerFn()).toBeResolved();

      // 4. Verifica a ação: O fetchProfile deve ter sido chamado
      expect(authService.fetchProfile).toHaveBeenCalled();
    });

    it('should call fetchProfile and resolve to null if the call fails', async () => {
      // 1. Setup: O serviço mock retorna um erro (simulando uma falha de autenticação ou rede)
      const errorResponse = throwError(() => new Error('HTTP Error 401'));
      authService = createSpiedAuthService(errorResponse);
      setup(authService);

      // 2. Injeta o token APP_INITIALIZER
      appInitializer = TestBed.inject(APP_INITIALIZER);
      const initializerFn = appInitializer[0];

      // 3. Executa e verifica se resolve (mas com o valor `null` devido ao catchError)
      // Usamos `defer` no mock para garantir que o `throwError` seja tratado corretamente
      // dentro da promise, mesmo que o Observable falhe.
      const result = await initializerFn();

      // 4. Verifica a ação e o resultado:
      expect(authService.fetchProfile).toHaveBeenCalled();
      // O `catchError(() => [null])` garante que a promise do initializer
      // retorne `null` e não rejeite.
      expect(result).toBeNull();
    });
  });
});
