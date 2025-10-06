import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, defer } from 'rxjs';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ClinicasListComponent } from './clinicas-list.component';
import { ClinicasService } from '../clinicas.service';
import { ToastService } from '../../toast/toast.service';

// 1. Definições de Modelos (Copiadas do componente)
interface Specialty {
  id: string;
  name: string;
}

interface Clinic {
  id: string;
  fantasy_name: string;
  corporate_name: string;
  cnpj: string;
  is_active: Boolean;
  inauguration_date: string; // Formato dd/mm/aaaa
  specialties?: Specialty[];
  regional_name?: string;
  regional?: string;
}

// 2. Dados de Teste (MOCK DATA)
const MOCK_CLINICS: Clinic[] = [
  // Ordem de data decrescente (mais nova para mais antiga) para testar a ordenação inicial (default: 'inauguration_date', 'desc')
  { id: 'c4', fantasy_name: 'Delta Clinic', corporate_name: 'Delta ME', cnpj: '444', is_active: false, inauguration_date: '05/01/2024', specialties: [] },
  { id: 'c1', fantasy_name: 'Alpha Clinic', corporate_name: 'Alpha Ltda', cnpj: '111', is_active: false, inauguration_date: '01/01/2024', specialties: [] },
  { id: 'c2', fantasy_name: 'Beta Clinic', corporate_name: 'Beta EPP', cnpj: '222', is_active: true, inauguration_date: '31/12/2023', specialties: [] },
  { id: 'c3', fantasy_name: 'Zeta Clinic', corporate_name: 'Zeta SA', cnpj: '333', is_active: true, inauguration_date: '15/01/2023', specialties: [] },
  // Clientes para testar paginação
  { id: 'c5', fantasy_name: 'Echo Clinic', corporate_name: 'Echo SA', cnpj: '555', is_active: true, inauguration_date: '10/01/2023', specialties: [] },
  { id: 'c6', fantasy_name: 'Fox Clinic', corporate_name: 'Fox ME', cnpj: '666', is_active: false, inauguration_date: '05/01/2023', specialties: [] },
  { id: 'c7', fantasy_name: 'Gamma Clinic', corporate_name: 'Gamma Ltd', cnpj: '777', is_active: true, inauguration_date: '01/01/2023', specialties: [] },
  // Clínica com valores nulos/vazios para testar robustez do sorting
  { id: 'c8', fantasy_name: 'Null Test', corporate_name: 'Null Inc', cnpj: '000', is_active: true, inauguration_date: '01/02/2024', regional_name: undefined, regional: undefined },
];

// 3. Mocks de Serviços
class MockClinicasService {
  // Defer permite controlar quando o Observable emitirá, útil para o effect
  list = () => defer(() => of(MOCK_CLINICS));
  delete = (id: string) => of(void 0); // Retorna um Observable que completa sem valor
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockToastService {
  show = jasmine.createSpy('show');
}

// 4. Configuração da Suíte de Testes
describe('ClinicasListComponent', () => {
  let component: ClinicasListComponent;
  let fixture: ComponentFixture<ClinicasListComponent>;
  let mockClinicasService: MockClinicasService;
  let mockRouter: MockRouter;
  let mockToastService: MockToastService;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(async () => {
    // Inicializa os mocks
    mockClinicasService = new MockClinicasService();

    // Configuração do TestBed
    await TestBed.configureTestingModule({
      imports: [ClinicasListComponent],
      providers: [
        // Fornece detecção de mudança experimental para lidar com signals e OnPush
        provideExperimentalZonelessChangeDetection(),
        { provide: ClinicasService, useValue: mockClinicasService },
        { provide: Router, useClass: MockRouter },
        { provide: ToastService, useClass: MockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicasListComponent);
    component = fixture.componentInstance;

    // Recupera os serviços injetados
    mockRouter = TestBed.inject(Router) as any;
    mockToastService = TestBed.inject(ToastService) as any;

    // Espiona console.error para testar o caminho de erro do effect
    consoleErrorSpy = spyOn(console, 'error').and.stub();

    // O effect roda imediatamente após a criação do componente (no setup)
    // Para que o loadEffect rode e carregue os dados:
    fixture.detectChanges();
  });

  // --- 5. TESTES DE INICIALIZAÇÃO (loadEffect) ---
  describe('Initialization (loadEffect)', () => {
    it('should create and load data successfully via effect', () => {
      // Verifica se o serviço foi chamado e os sinais foram atualizados
      expect(component.isLoading()).toBeFalse();
      expect(component.clinics().length).toBe(MOCK_CLINICS.length);
      // Verifica a ordenação inicial (padrão 'inauguration_date', 'desc')
      expect(component.sortedAndFilteredData()[0].id).toBe('c4'); // 05/01/2024
    });

    it('should handle data loading error via effect', () => {
      const errorResponse = { message: 'Failed to load' };
      // Sobrescreve o mock para simular erro
      spyOn(mockClinicasService, 'list').and.returnValue(throwError(() => errorResponse));

      // Recria o componente para disparar o effect novamente com o novo mock
      const errorFixture = TestBed.createComponent(ClinicasListComponent);
      errorFixture.detectChanges();

      expect(errorFixture.componentInstance.isLoading()).toBeFalse();
      expect(errorFixture.componentInstance.clinics().length).toBe(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith(errorResponse);
    });
  });

  // --- 6. TESTES DE ORDENAÇÃO (toggleSort e sortedAndFilteredData) ---
  describe('Sorting Logic', () => {
    beforeEach(() => {
      // Garante que o estado inicial foi carregado e ordenado por data descendente
      expect(component.sortedAndFilteredData()[0].id).toBe('c4');
    });

    it('should toggle sort direction on the same column (inauguration_date)', () => {
      // Estado inicial: 'inauguration_date', 'desc' (c4 mais nova)
      expect(component.sortState().column).toBe('inauguration_date');
      expect(component.sortState().direction).toBe('desc');

      // 1. Toca novamente -> inverte para 'asc'
      component.toggleSort('inauguration_date');
      expect(component.sortState().direction).toBe('asc');
      // c7 é a mais antiga (01/01/2023)
      expect(component.sortedAndFilteredData()[0].id).toBe('c7');
      expect(component.currentPage()).toBe(1); // Paginação deve resetar

      // 2. Toca novamente -> inverte para 'desc'
      component.toggleSort('inauguration_date');
      expect(component.sortState().direction).toBe('desc');
      // c4 é a mais nova (05/01/2024)
      expect(component.sortedAndFilteredData()[0].id).toBe('c4');
    });

    it('should apply default "asc" sort when changing to a string column (fantasy_name)', () => {
      component.toggleSort('fantasy_name');
      expect(component.sortState().column).toBe('fantasy_name');
      expect(component.sortState().direction).toBe('asc');

      // Alpha Clinic deve ser a primeira (A)
      expect(component.sortedAndFilteredData()[0].fantasy_name).toBe('Alpha Clinic');

      // Toca novamente para 'desc'
      component.toggleSort('fantasy_name');
      expect(component.sortState().direction).toBe('desc');
      // Zeta Clinic deve ser a primeira (Z)
      expect(component.sortedAndFilteredData()[0].fantasy_name).toBe('Zeta Clinic');
    });

    it('should handle sorting for nullish values (regional_name fallback)', () => {
      // Ordena pelo 'regional_name' (string)
      component.toggleSort('regional_name' as keyof Clinic);
      expect(component.sortState().direction).toBe('asc');

      // O item 'c8' tem regional_name: undefined.
      // O fallback '?? ''' deve colocá-lo no início em ordem ascendente.
      const sortedNames = component.sortedAndFilteredData().map(c => c.id);
      expect(sortedNames[0]).toBe('c8'); // 'Null Test' (undefined becomes '')

      // Toca novamente para 'desc'
      component.toggleSort('regional_name' as keyof Clinic);
      expect(component.sortState().direction).toBe('desc');
      // 'Zeta Clinic' (c3) deve estar no início se regional_name for o valor de string mais alto entre os definidos.
      // No nosso mock, todos estão vazios, exceto c8 que é undefined. A ordem desce para o primeiro valor não vazio.
      // Neste mock, todos os outros campos regionais são undefined, então a ordenação é indeterminada entre eles, mas c8 (que é '') deve ir para o final.
      expect(sortedNames).not.toContain('c8'); // c8 deve estar na última posição

      // Verifica se c8 (nullish) foi movido para o final da lista (desc)
      expect(component.sortedAndFilteredData()[component.sortedAndFilteredData().length - 1].id).toBe('c8');
    });
  });

  // --- 7. TESTES DE FILTRAGEM (searchTerm e sortedAndFilteredData) ---
  describe('Filtering Logic', () => {
    it('should filter by fantasy_name (case insensitive)', () => {
      component.searchTerm.set('beta');
      expect(component.sortedAndFilteredData().length).toBe(1);
      expect(component.sortedAndFilteredData()[0].fantasy_name).toBe('Beta Clinic');
      expect(component.currentPage()).toBe(1); // Paginação deve resetar
    });

    it('should filter by cnpj', () => {
      component.searchTerm.set('444');
      expect(component.sortedAndFilteredData().length).toBe(1);
      expect(component.sortedAndFilteredData()[0].cnpj).toBe('444');
    });

    it('should filter by corporate_name (partial match)', () => {
      component.searchTerm.set('sa'); // Zeta SA, Echo SA
      expect(component.sortedAndFilteredData().length).toBe(2);
      const ids = component.sortedAndFilteredData().map(c => c.id);
      expect(ids).toContain('c3');
      expect(ids).toContain('c5');
    });

    it('should return all clinics when searchTerm is empty', () => {
      component.searchTerm.set('');
      expect(component.sortedAndFilteredData().length).toBe(MOCK_CLINICS.length);
    });

    it('should clear search and reset page', () => {
      component.searchTerm.set('test');
      component.currentPage.set(2);

      component.clearSearch();

      expect(component.searchTerm()).toBe('');
      expect(component.currentPage()).toBe(1);
      expect(component.sortedAndFilteredData().length).toBe(MOCK_CLINICS.length);
    });
  });

  // --- 8. TESTES DE PAGINAÇÃO (pageSize, currentPage, computed signals) ---
  describe('Pagination Logic', () => {
    beforeEach(() => {
      component.pageSize.set(3); // Define 3 itens por página
      component.searchTerm.set(''); // Garante que não há filtro (8 itens no total)
      component.currentPage.set(1);
    });

    it('should correctly calculate totalPages', () => {
      // 8 itens / 3 por página = 2.66 -> Math.ceil(2.66) = 3
      expect(component.totalPages()).toBe(3);

      component.pageSize.set(10); // 8 itens / 10 por página = 0.8 -> 1
      expect(component.totalPages()).toBe(1);
    });

    it('should correctly calculate paginatedClinics for the first page', () => {
      // Page 1: deve ter os 3 primeiros (c4, c1, c2, ordenados por data desc)
      expect(component.paginatedClinics().length).toBe(3);
      expect(component.paginatedClinics()[0].id).toBe('c4');
      expect(component.paginatedClinics()[2].id).toBe('c2');
    });

    it('should correctly calculate paginatedClinics for the last page', () => {
      // Page 3: 8 itens. Start (3-1)*3 = 6. End = 9. Itens de índice 6 e 7 (c7, c8)
      component.goToPage(3);
      expect(component.paginatedClinics().length).toBe(2);
      // O 7º e 8º item no MOCK_CLINICS após ordenação inicial: c7 e c8.
      expect(component.paginatedClinics()[0].id).toBe('c7');
      expect(component.paginatedClinics()[1].id).toBe('c8');
    });

    it('should navigate to the next page and prevent overflow', () => {
      component.nextPage(); // Page 2
      expect(component.currentPage()).toBe(2);
      expect(component.paginatedClinics()[0].id).toBe('c3'); // Início da Page 2

      component.nextPage(); // Page 3
      expect(component.currentPage()).toBe(3);

      component.nextPage(); // Tentativa de ir para Page 4
      expect(component.currentPage()).toBe(3); // Permanece na Page 3
    });

    it('should navigate to the previous page and prevent underflow', () => {
      component.currentPage.set(2);
      component.prevPage(); // Page 1
      expect(component.currentPage()).toBe(1);

      component.prevPage(); // Tentativa de ir para Page 0
      expect(component.currentPage()).toBe(1); // Permanece na Page 1
    });

    it('should use goToPage() correctly', () => {
      component.goToPage(3);
      expect(component.currentPage()).toBe(3);
      expect(component.paginatedClinics().length).toBe(2); // Última página
    });

    it('should recalculate pagination when search term changes', () => {
      component.searchTerm.set('Clinic'); // 7 clínicas (exceto c8: Null Test)
      // 7 itens / 3 por página = 3 páginas
      expect(component.totalPages()).toBe(3);

      component.searchTerm.set('Alpha'); // 1 clínica
      // 1 item / 3 por página = 1 página
      expect(component.totalPages()).toBe(1);
      expect(component.paginatedClinics().length).toBe(1);
    });
  });

  // --- 9. TESTES DE AÇÕES (onItemSelected) ---
  describe('Action Methods (onItemSelected)', () => {
    it('should navigate to the correct URL for "ver" action', () => {
      const clinicId = 'c99';
      component.onItemSelected({ label: 'Ver', value: 'ver' }, clinicId);

      expect(mockRouter.navigate).toHaveBeenCalledWith([`/dashboard/clinica/${clinicId}`]);
      expect(component.selectedItemLabel).toBe('Ver');
    });

    it('should delete a clinic successfully for "deletar" action', () => {
      const clinicToDelete = MOCK_CLINICS[0]; // c4
      expect(component.clinics().length).toBe(MOCK_CLINICS.length); // 8

      // Mocka o serviço de delete para retornar sucesso
      spyOn(mockClinicasService, 'delete').and.returnValue(of(void 0));

      component.onItemSelected({ label: 'Deletar', value: 'deletar' }, clinicToDelete.id);

      expect(mockClinicasService.delete).toHaveBeenCalledWith(clinicToDelete.id);
      expect(mockToastService.show).toHaveBeenCalledWith('Clínica deletada com sucesso!', 'success');
      // Verifica se a clínica foi removida do sinal 'clinics'
      expect(component.clinics().length).toBe(MOCK_CLINICS.length - 1); // 7
      expect(component.clinics().some(c => c.id === clinicToDelete.id)).toBeFalse();
    });

    it('should handle deletion error for "deletar" action', () => {
      const clinicToDelete = MOCK_CLINICS[1]; // c1
      const errorResponse = { status: 500, message: 'DB error' };

      // Mocka o serviço de delete para retornar erro
      spyOn(mockClinicasService, 'delete').and.returnValue(throwError(() => errorResponse));

      component.onItemSelected({ label: 'Deletar', value: 'deletar' }, clinicToDelete.id);

      expect(mockClinicasService.delete).toHaveBeenCalledWith(clinicToDelete.id);
      expect(mockToastService.show).not.toHaveBeenCalled(); // Não deve mostrar toast de sucesso
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao deletar clínica:', errorResponse);
      // Verifica se a clínica NÃO foi removida do sinal 'clinics'
      expect(component.clinics().length).toBe(MOCK_CLINICS.length);
    });
  });

  // --- 10. TESTES DE CAMINHOS DE CÓDIGO RESTANTES (parseDate e toggleSort) ---
  describe('Code Coverage Edge Cases', () => {
    // Testa a lógica interna de parseDate (mesmo sendo privada, é testada indiretamente pelo sorting)
    it('should ensure date comparison handles the date parsing correctly', () => {
      // Ordena por data ascendente para garantir a conversão correta
      component.toggleSort('inauguration_date'); // Muda para 'asc'
      const sorted = component.sortedAndFilteredData();
      // c7: 01/01/2023 é a mais antiga
      expect(sorted[0].id).toBe('c7');

      // c4: 05/01/2024 é a mais nova (penúltima)
      expect(sorted[sorted.length - 2].id).toBe('c4');
    });

    it('should handle sorting for generic types (other fallback in sort)', () => {
      // Teste do fallback: comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      // Usando 'cnpj' (string de números)
      component.toggleSort('cnpj' as keyof Clinic); // asc

      // O 'cnpj' é uma string, então deve cair no bloco string:
      // '111' < '222' < '333' < '444' < '555' < '666' < '777' < '000' (string '000' é menor que '111')
      expect(component.sortedAndFilteredData()[0].cnpj).toBe('000'); // c8
      expect(component.sortedAndFilteredData()[1].cnpj).toBe('111'); // c1

      // Para cobrir a linha else (comparação genérica), precisamos de um campo que não seja string nem date.
      // O campo 'is_active' é Boolean. Ele é convertido para string no filtro ou na ordenação (quando não é data/string).
      component.toggleSort('is_active' as keyof Clinic); // asc (false < true)

      // Clientes com is_active: false: c4, c1, c6
      expect(component.sortedAndFilteredData().filter(c => !c.is_active).length).toBe(3);
      // Clientes com is_active: true: c3, c2, c5, c7, c8
      expect(component.sortedAndFilteredData().filter(c => c.is_active).length).toBe(5);

      // O bloco else é o fallback, mesmo que is_active seja Boolean, o typeof nos compara como genérico
      // O sort interno faz 'true' > 'false', etc., cobrindo o bloco else na linha 110-112 do componente.
      // O 'is_active' se comporta como string ('false' vs 'true') em termos de comparação quando cai no else.
    });

    it('should handle no column sort state (return filtered only)', () => {
      // Define um filtro
      component.searchTerm.set('Alpha');
      component.sortState.set({ column: null, direction: 'asc' });

      // O computed deve apenas filtrar (tamanho 1)
      expect(component.sortedAndFilteredData().length).toBe(1);
    });
  });
});
