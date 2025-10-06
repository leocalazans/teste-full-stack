import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ClinicasViewComponent } from './clinicas-view.component';
import { Clinic } from '../clinicas.model';
import { clinicasStore } from '../clinic.store';

// --- Mocks de Dados ---
const MOCK_ACTIVE_CLINIC: Clinic = {
  id: 'c1',
  fantasy_name: 'Alpha Active',
  corporate_name: 'Alpha Corp',
  cnpj: '111',
  is_active: true,
  inauguration_date: '01/01/2023',
  specialties: [{ id: 's1', name: 'Cardiologia' }, { id: 's2', name: 'Ortopedia' }],
  regional: 'SP',
  regional_name: 'São Paulo',
};

const MOCK_INACTIVE_CLINIC: Clinic = {
  ...MOCK_ACTIVE_CLINIC,
  id: 'c2',
  fantasy_name: 'Beta Inactive',
  is_active: false,
};

// --- Mock de Serviços e Dependências ---
const mockLocation = {
  back: jasmine.createSpy('back'),
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

const mockClinicasStore = {
  selectClinic: jasmine.createSpy('selectClinic'),
};

describe('ClinicasViewComponent', () => {
  let component: ClinicasViewComponent;
  let fixture: ComponentFixture<ClinicasViewComponent>;
  let locationSpy: jasmine.Spy;
  let routerSpy: jasmine.Spy;
  let storeSpy: jasmine.SpyObj<clinicasStore>;

  // Função utilitária para configurar o módulo de teste com dados de rota específicos
  const setupTestBed = (clinicData: Clinic | undefined) => {
    TestBed.configureTestingModule({
      imports: [ClinicasViewComponent],
      providers: [
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
        { provide: clinicasStore, useValue: mockClinicasStore },
        // Mocking ActivatedRoute para simular a resolução de dados
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                clinic: clinicData,
              },
            },
          },
        },
      ],
    }).compileComponents();
  };


  beforeEach(() => {
    // Inicializa com uma clínica ativa
    setupTestBed(MOCK_ACTIVE_CLINIC);

    fixture = TestBed.createComponent(ClinicasViewComponent);
    component = fixture.componentInstance;

    locationSpy = mockLocation.back as jasmine.Spy;
    routerSpy = mockRouter.navigate as jasmine.Spy;
    storeSpy = mockClinicasStore as jasmine.SpyObj<clinicasStore>;

    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  // --- Testes de Inicialização e Computed Signals ---

  it('deve carregar a clínica da rota e ser Ativa por padrão', () => {
    // Verifica a inicialização do signal 'clinic'
    expect(component.clinic()?.id).toBe(MOCK_ACTIVE_CLINIC.id);

    // Verifica computed signals para status Ativa
    expect(component.statusText()).toBe('Ativa');
    expect(component.statusClass()).toBe('bg-green-600');
  });

  it('deve exibir status Inativa e classe correta para clínica inativa', () => {
    // Reconfigura o componente com a clínica inativa
    setupTestBed(MOCK_INACTIVE_CLINIC);
    const inactiveFixture = TestBed.createComponent(ClinicasViewComponent);
    const inactiveComponent = inactiveFixture.componentInstance;
    inactiveFixture.detectChanges();

    // Verifica computed signals para status Inativa
    expect(inactiveComponent.statusText()).toBe('Inativa');
    expect(inactiveComponent.statusClass()).toBe('bg-red-600');
  });

  it('deve lidar corretamente se nenhuma clínica for resolvida', () => {
    // Reconfigura o componente sem dados de clínica
    setupTestBed(undefined);
    const noDataFixture = TestBed.createComponent(ClinicasViewComponent);
    const noDataComponent = noDataFixture.componentInstance;
    noDataFixture.detectChanges();

    expect(noDataComponent.clinic()).toBeUndefined();
    // Computed signals devem ser avaliados sem erro
    expect(noDataComponent.statusText()).toBe('Inativa'); // Default text for undefined
    expect(noDataComponent.statusClass()).toBe('bg-red-600'); // Default class for undefined
  });

  // --- Testes de Ações e Navegação ---

  it('deve navegar de volta ao chamar goBack', () => {
    component.goBack();
    expect(locationSpy).toHaveBeenCalled();
  });

  it('deve configurar a store e navegar para a rota de edição ao chamar editClinic', () => {
    // Chama o método de edição
    component.editClinic();

    // 1. Deve chamar a store para selecionar a clínica (passando a clínica completa)
    expect(storeSpy.selectClinic).toHaveBeenCalledWith(MOCK_ACTIVE_CLINIC);

    // 2. Deve navegar para a rota de edição com o ID correto
    expect(routerSpy).toHaveBeenCalledWith(
      ['/dashboard/clinica/editar', MOCK_ACTIVE_CLINIC.id]
    );
  });

  it('não deve tentar editar se clinic() for undefined', () => {
    // Reconfigura o componente sem dados de clínica
    setupTestBed(undefined);
    const noDataFixture = TestBed.createComponent(ClinicasViewComponent);
    const noDataComponent = noDataFixture.componentInstance;
    noDataFixture.detectChanges();

    noDataComponent.editClinic();

    // Não deve chamar a store ou o router
    expect(storeSpy.selectClinic).not.toHaveBeenCalled();
    expect(routerSpy).not.toHaveBeenCalled();
  });

  // --- Testes de Modal ---

  it('deve abrir o modal ao chamar openModal ou showAllSpecialty', () => {
    component.openModal();
    expect(component.isModalOpen()).toBeTrue();

    component.isModalOpen.set(false); // Reset

    component.showAllSpecialty();
    expect(component.isModalOpen()).toBeTrue();
  });

  it('deve fechar o modal ao chamar closeModal', () => {
    component.isModalOpen.set(true); // Abre
    component.closeModal();
    expect(component.isModalOpen()).toBeFalse();
  });

});
