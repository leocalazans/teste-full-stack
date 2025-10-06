import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { of, throwError, Observable } from 'rxjs'; // Importando Observable
import { ClinicasService } from './clinicas.service';
import { Clinic } from './clinicas.model';
import { clinicaResolver } from './clinicas.resolver';

// --- Mocks ---
const MOCK_CLINIC: Clinic = {
  id: '1',
  fantasy_name: 'Clínica Exemplo',
  corporate_name: 'Exemplo Saúde LTDA',
  cnpj: '12.345.678/0001-99',
  is_active: true,
  inauguration_date: '10/05/2020',
};

// Mock para o Router (usamos um spy para verificar o redirecionamento)
const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

// Mock para o ClinicasService
const mockClinicasService = {
  getClinicById: jasmine.createSpy('getClinicById'),
};

describe('clinicaResolver', () => {
  let clinicasServiceSpy: jasmine.SpyObj<ClinicasService>;
  let routerSpy: jasmine.Spy;

  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ClinicasService, useValue: mockClinicasService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    clinicasServiceSpy = TestBed.inject(ClinicasService) as jasmine.SpyObj<ClinicasService>;
    routerSpy = TestBed.inject(Router).navigate as jasmine.Spy;

    // Reseta o spy do router antes de cada teste
    routerSpy.calls.reset();
  });

  // --- Teste 1: Caminho de Sucesso (ID OK, API OK) ---
  it('deve resolver e retornar os dados da clínica pelo ID', (done) => {
    // Arrange
    clinicasServiceSpy.getClinicById.and.returnValue(of(MOCK_CLINIC));

    const mockRoute = {
      paramMap: new Map([['id', '1']]),
    } as unknown as ActivatedRouteSnapshot;

    // Act
    const result$ = TestBed.runInInjectionContext(() => clinicaResolver(mockRoute, mockState)) as Observable<Clinic | null>; // ⬅️ Cast explícito

    // Assert
    result$.subscribe((result) => {
      // O tipo 'result' é Clinic | null, mas sabemos que neste caminho é Clinic
      expect(result).toEqual(MOCK_CLINIC);
      expect(clinicasServiceSpy.getClinicById).toHaveBeenCalledWith('1');
      expect(routerSpy).not.toHaveBeenCalled(); // Não deve redirecionar
      done();
    });
  });

  // --- Teste 2: Caminho de Erro da API (Força o catchError) ---
  it('deve redirecionar para a lista e retornar null se o serviço falhar', (done) => {
    // Arrange
    const mockError = new Error('Erro 404');
    clinicasServiceSpy.getClinicById.and.returnValue(throwError(() => mockError));

    const mockRoute = {
      paramMap: new Map([['id', '999']]),
    } as unknown as ActivatedRouteSnapshot;

    // Act
    const result$ = TestBed.runInInjectionContext(() => clinicaResolver(mockRoute, mockState)) as Observable<Clinic | null>; // ⬅️ Cast explícito

    // Assert
    result$.subscribe((result) => {
      expect(result).toBeNull();
      expect(clinicasServiceSpy.getClinicById).toHaveBeenCalledWith('999');
      // Deve ter chamado o redirecionamento
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard/clinicas']);
      done();
    });
  });

  // --- Teste 3: Caminho de ID Ausente (Força o if (!id)) ---
  it('deve redirecionar para a lista e retornar null se o ID da rota estiver ausente', (done) => {
    // Arrange
    // Rota mockada SEM o parâmetro 'id'
    const routeWithoutId: ActivatedRouteSnapshot = {
      paramMap: new Map(),
    } as unknown as ActivatedRouteSnapshot;

    // Garante que o serviço NÃO é chamado
    clinicasServiceSpy.getClinicById.calls.reset();

    // Act
    const result$ = TestBed.runInInjectionContext(() => clinicaResolver(routeWithoutId, mockState)) as Observable<Clinic | null>; // ⬅️ Cast explícito

    // Assert
    result$.subscribe((result) => {
      expect(result).toBeNull();
      // Não deve ter chamado o serviço
      expect(clinicasServiceSpy.getClinicById).not.toHaveBeenCalled();
      // Deve ter chamado o redirecionamento
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard/clinicas']);
      done();
    });
  });
});
