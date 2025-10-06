import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardHeaderComponent } from './dashboard-header.component';
import { AuthService, User } from '../../features/auth/auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';

// --- Mocks ---

// Mock para a interface User
const mockUser: User = {
  id: '123',
  name: 'João Teste',
  email: 'joao@teste.com'
};

// Mock para AuthService
class MockAuthService {
  // O componente usa o Observable, então precisamos de um BehaviorSubject
  currentUser$ = new BehaviorSubject<User | null>(null);

  logout = jasmine.createSpy('logout').and.returnValue(of(true));
}

// Mock para Router
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('DashboardHeaderComponent', () => {
  let component: DashboardHeaderComponent;
  let fixture: ComponentFixture<DashboardHeaderComponent>;
  let mockAuthService: MockAuthService;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    // Instancia os mocks para uso no TestBed
    mockAuthService = new MockAuthService();
    mockRouter = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [DashboardHeaderComponent, CommonModule], // Importa o componente (standalone) e CommonModule
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    })
      // Sobrescreve a estratégia de detecção de mudanças para default para facilitar o teste
      .overrideComponent(DashboardHeaderComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default }
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Inicializa o componente e o toSignal
  });

  // --- Testes de Inicialização e Signals ---

  it('should create and initialize currentUser signal with null', () => {
    expect(component).toBeTruthy();
    // Verifica o valor inicial do signal (definido no mock)
    expect(component.currentUser()).toBeNull();
  });

  it('should update currentUser signal when AuthService emits a user', () => {
    // 1. Simula a emissão de um usuário logado
    mockAuthService.currentUser$.next(mockUser);
    fixture.detectChanges();

    // 2. Verifica se o signal foi atualizado
    expect(component.currentUser()).toEqual(mockUser);
  });

  // --- Testes de Interações do Menu ---

  it('should toggle isProfileMenuOpen when openProfileMenu is called', () => {
    // Estado inicial: fechado
    expect(component.isProfileMenuOpen()).toBeFalse();

    // 1. Abre
    component.openProfileMenu();
    expect(component.isProfileMenuOpen()).toBeTrue();

    // 2. Fecha (toggle)
    component.openProfileMenu();
    expect(component.isProfileMenuOpen()).toBeFalse();
  });

  it('should prevent menu closure propagation when preventClose is called', () => {
    // Cria um objeto de evento mock para testar stopPropagation
    const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as unknown as Event;

    component.preventClose(mockEvent);

    // Verifica se stopPropagation foi chamado (impedindo que o HostListener seja acionado)
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });


  // --- Testes de HostListener (clickOutside) ---

  it('should close the profile menu on click outside the component', () => {
    // 1. Abre o menu
    component.isProfileMenuOpen.set(true);
    fixture.detectChanges();
    expect(component.isProfileMenuOpen()).toBeTrue();

    // 2. Simula um clique *fora* do componente (em document)
    // Usamos o objeto document.body para garantir que o click não contenha o elemento nativo
    const outsideElement = document.body;
    component.clickOutside({ target: outsideElement } as unknown as Event);

    // 3. Verifica se o menu fechou
    expect(component.isProfileMenuOpen()).toBeFalse();
  });

  it('should NOT close the profile menu on click inside the component', () => {
    // 1. Abre o menu
    component.isProfileMenuOpen.set(true);
    fixture.detectChanges();
    expect(component.isProfileMenuOpen()).toBeTrue();

    // 2. Simula um clique *dentro* do componente (usando o elemento nativo)
    const insideElement = fixture.nativeElement;
    component.clickOutside({ target: insideElement } as unknown as Event);

    // 3. Verifica se o menu *permanece* aberto
    expect(component.isProfileMenuOpen()).toBeTrue();
  });

  // --- Testes de Navegação e Logout ---

  it('should navigate to profile and close menu when goToProfile is called', () => {
    // 1. Abre o menu
    component.isProfileMenuOpen.set(true);

    // 2. Chama o método
    component.goToProfile();

    // 3. Verifica se o menu fechou
    expect(component.isProfileMenuOpen()).toBeFalse();
    // OBS: Não testamos console.log em testes unitários.
  });

  it('should call auth.logout and navigate to the root path on successful logout', () => {
    // 1. Chama o método
    component.logout();

    // 2. Verifica se o spy de logout foi chamado
    expect(mockAuthService.logout).toHaveBeenCalled();

    // 3. Verifica se o Router.navigate foi chamado para a rota raiz ('/')
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle error when logout fails', () => {
    // Sobrescreve o mock para retornar um erro
    const consoleErrorSpy = spyOn(console, 'error');
    (mockAuthService.logout as jasmine.Spy).and.returnValue(throwError(() => new Error('Forced Logout Error')));

    // 1. Chama o método
    component.logout();

    // 2. Verifica se a chamada ao router não foi feita (pois houve erro)
    expect(mockRouter.navigate).not.toHaveBeenCalled();

    // 3. Verifica se o erro foi logado (apenas para cobertura, não essencial, mas bom)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao fazer logout', jasmine.any(Error));
  });

});
