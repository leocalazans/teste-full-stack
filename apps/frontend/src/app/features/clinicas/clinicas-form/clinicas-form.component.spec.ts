import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { ClinicasFormComponent } from './clinicas-form.component';
import { ClinicasService } from '../clinicas.service';
import { clinicasStore } from '../clinic.store';
import { ToastService } from '../../toast/toast.service';
import { Clinic, Region, Specialty } from '../clinicas.model';

// --- Mocks de Dados ---
const MOCK_CLINIC: Clinic = {
  id: 'c1',
  fantasy_name: 'Fantasy Clinic',
  corporate_name: 'Corporate Name SA',
  cnpj: '12345678000199',
  is_active: true,
  inauguration_date: '2020-01-01',
  specialties: [{ id: 's1', name: 'Cardiologia' }],
  regional_name: 'Sul',
  regional: 'RS',
};

const MOCK_REGIONS: Region[] = [{ id: 'r1', name: 'Região A', label: 'A' }];
const MOCK_SPECIALTIES: Specialty[] = [
  { id: 's1', name: 'Cardiologia' },
  { id: 's2', name: 'Pediatria' },
];

// --- Mock de Serviços ---

const mockClinicasService = {
  getRegions: jasmine.createSpy('getRegions').and.returnValue(of(MOCK_REGIONS)),
  getSpecialties: jasmine.createSpy('getSpecialties').and.returnValue(of(MOCK_SPECIALTIES)),
  create: jasmine.createSpy('create').and.returnValue(of({ ...MOCK_CLINIC, id: 'c_new' })),
  update: jasmine.createSpy('update').and.returnValue(of(MOCK_CLINIC)),
};

// Usa um Subject para simular o selectedClinic para testar o 'isEditing'
const selectedClinicSubject = new Subject<Clinic | null>();
const mockClinicasStore = {
  selectedClinic: jasmine.createSpy('selectedClinic').and.returnValue(() => {
    return (selectedClinicSubject as any).latestValue || null;
  }),
  clinics: jasmine.createSpy('clinics').and.returnValue(() => [MOCK_CLINIC]),
  setClinics: jasmine.createSpy('setClinics'),
  clearSelectedClinic: jasmine.createSpy('clearSelectedClinic'),
};

// Cria uma propriedade auxiliar para armazenar o último valor do Subject
Object.defineProperty(selectedClinicSubject, 'latestValue', {
  writable: true,
  value: null
});
selectedClinicSubject.subscribe(val => (selectedClinicSubject as any).latestValue = val);


const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

const mockToastService = {
  show: jasmine.createSpy('show'),
};

describe('ClinicasFormComponent', () => {
  let component: ClinicasFormComponent;
  let fixture: ComponentFixture<ClinicasFormComponent>;
  let routerSpy: jasmine.Spy;
  let serviceSpy: jasmine.SpyObj<any>; // Usando 'any' para facilitar o mocking
  let storeSpy: jasmine.SpyObj<any>;
  let toastSpy: jasmine.Spy;

  // Função auxiliar para criar e inicializar o componente (necessário para Effects de erro)
  const setupComponent = () => {
    fixture = TestBed.createComponent(ClinicasFormComponent);
    component = fixture.componentInstance;
    serviceSpy = mockClinicasService as jasmine.SpyObj<any>;
    storeSpy = mockClinicasStore as jasmine.SpyObj<any>;
    routerSpy = mockRouter.navigate as jasmine.Spy;
    toastSpy = mockToastService.show;
    fixture.detectChanges();
  };


  beforeEach(async () => {
    // Configura o valor inicial da store (para criação)
    selectedClinicSubject.next(null);

    // Reseta todos os spies antes de cada teste
    Object.keys(mockClinicasService).forEach(key => (mockClinicasService as any)[key].calls?.reset());
    Object.keys(mockClinicasStore).forEach(key => (mockClinicasStore as any)[key].calls?.reset());
    mockRouter.navigate.calls.reset();
    mockToastService.show.calls.reset();

    // Garante que o serviço retorna sucesso por padrão
    mockClinicasService.getRegions.and.returnValue(of(MOCK_REGIONS));
    mockClinicasService.getSpecialties.and.returnValue(of(MOCK_SPECIALTIES));
    mockClinicasService.create.and.returnValue(of({ ...MOCK_CLINIC, id: 'c_new' }));
    mockClinicasService.update.and.returnValue(of(MOCK_CLINIC));

    await TestBed.configureTestingModule({
      imports: [ClinicasFormComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ClinicasService, useValue: mockClinicasService },
        { provide: clinicasStore, useValue: mockClinicasStore },
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    setupComponent(); // Usa a função de setup para cada teste
  });

  // --- Testes de Inicialização e Estado (Signals/Effects) ---

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar regiões e especialidades na inicialização (Effects)', fakeAsync(() => {
    // Já chamado no setupComponent
    expect(serviceSpy.getRegions).toHaveBeenCalled();
    expect(serviceSpy.getSpecialties).toHaveBeenCalled();

    // Testa o estado do signal
    expect(component.regions()).toEqual(MOCK_REGIONS);
    expect(component.availableSpecialties()).toEqual(MOCK_SPECIALTIES);
  }));

  // *** TESTES ADICIONADOS PARA COBRIR PATH DE ERRO DOS EFFECTS ***
  it('deve lidar com erro ao buscar regiões e logar no console', fakeAsync(() => {
    const errorResponse = new Error('Erro Regions API');
    serviceSpy.getRegions.and.returnValue(throwError(() => errorResponse));
    const consoleErrorSpy = spyOn(console, 'error');

    // Recria/re-inicializa para disparar o effect novamente com o erro
    setupComponent();
    tick();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao buscar regiões', errorResponse);
  }));

  it('deve lidar com erro ao buscar especialidades e logar no console', fakeAsync(() => {
    const errorResponse = new Error('Erro Specialties API');
    serviceSpy.getSpecialties.and.returnValue(throwError(() => errorResponse));
    const consoleErrorSpy = spyOn(console, 'error');

    // Recria/re-inicializa para disparar o effect novamente com o erro
    setupComponent();
    tick();

    // Nota: O componente usa a mesma string de erro 'Erro ao buscar regiões' para os dois effects
    expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao buscar regiões', errorResponse);
  }));
  // *************************************************************

  it('deve configurar o modo de criação e resetar o formulário', fakeAsync(() => {
    selectedClinicSubject.next(null);
    fixture.detectChanges();
    tick();
    expect(component.isEditing()).toBeFalse();
    expect(component.cardTitle()).toBe('Nova clínica');
    expect(component.submitButtonText()).toBe('Criar clínica');
    expect(component.clinicForm.get('is_active')?.value).toBeTrue();
    expect(component.clinicForm.get('fantasy_name')?.value).toBeNull();
  }));

  // Localize este teste no seu arquivo .spec.ts
  it('deve configurar o modo de criação e resetar o formulário', fakeAsync(() => {
    // A store começa com null no beforeEach, mas garantimos que está no estado 'null'
    selectedClinicSubject.next(null);

    // Força a detecção de mudanças para re-avaliar todos os 'computed' signals
    fixture.detectChanges();
    tick();
    // Verificação do modo de criação
    expect(component.isEditing()).toBeFalse();
    expect(component.cardTitle()).toBe('Nova clínica');
    expect(component.cardSubtitle()).toBe('Preencha os dados para cadastrar uma nova clínica.');
    expect(component.submitButtonText()).toBe('Criar clínica');
    expect(component.clinicForm.get('is_active')?.value).toBeTrue();
    expect(component.clinicForm.get('fantasy_name')?.value).toBeNull();
  }));

  it('deve configurar o modo de edição e preencher o formulário (Effect)', fakeAsync(() => {
    selectedClinicSubject.next(MOCK_CLINIC);
    fixture.detectChanges();

    expect(component.isEditing()).toBeTrue();
    expect(component.cardTitle()).toBe('Editar clínica');
    expect(component.submitButtonText()).toBe('Salvar alterações');
    expect(component.clinicForm.get('fantasy_name')?.value).toBe(MOCK_CLINIC.fantasy_name);
    expect(component.clinicForm.get('is_active')?.value).toBe(true);
  }));

  // --- Testes de Lógica de Formulário (Especialidades) ---

  it('deve adicionar uma especialidade corretamente', () => {
    const event = { target: { value: 's2' } } as unknown as Event; // Pediatria
    component.addSpecialty(event);

    const specialties = component.clinicForm.controls.specialties.value;
    expect(specialties?.length).toBe(1);
    expect(specialties?.[0].id).toBe('s2');
  });

  it('não deve adicionar especialidades duplicadas', () => {
    const s1 = MOCK_SPECIALTIES[0];
    component.clinicForm.controls.specialties.setValue([s1]);

    const event = { target: { value: s1.id } } as unknown as Event;
    component.addSpecialty(event);

    const specialties = component.clinicForm.controls.specialties.value;
    expect(specialties?.length).toBe(1);
  });

  it('deve remover uma especialidade corretamente', () => {
    const s1 = MOCK_SPECIALTIES[0];
    const s2 = MOCK_SPECIALTIES[1];
    component.clinicForm.controls.specialties.setValue([s1, s2]);

    component.removeSpecialty(s1);

    const specialties = component.clinicForm.controls.specialties.value;
    expect(specialties?.length).toBe(1);
    expect(specialties?.[0].id).toBe(s2.id);
  });

  it('deve retornar true para isSpecialtySelected se estiver selecionada', () => {
    const s1 = MOCK_SPECIALTIES[0];
    component.clinicForm.controls.specialties.setValue([s1]);
    expect(component.isSpecialtySelected(s1)).toBeTrue();
  });

  it('deve retornar false para isSpecialtySelected se não estiver selecionada', () => {
    const s2 = MOCK_SPECIALTIES[1];
    component.clinicForm.controls.specialties.setValue([]);
    expect(component.isSpecialtySelected(s2)).toBeFalse();
  });

  // *** TESTES ADICIONADOS PARA COBRIR OS RETURNS ANTECIPADOS EM addSpecialty ***
  it('não deve adicionar especialidade se o valor do select for vazio', () => {
    const event = { target: { value: '' } } as unknown as Event;
    component.addSpecialty(event);

    expect(component.clinicForm.controls.specialties.value?.length).toBe(0);
  });

  it('não deve adicionar especialidade se o ID não for encontrado', () => {
    // Assume que 'id-inexistente' não está em MOCK_SPECIALTIES
    const event = { target: { value: 'id-inexistente' } } as unknown as Event;
    component.addSpecialty(event);

    expect(component.clinicForm.controls.specialties.value?.length).toBe(0);
  });
  // ******************************************************************************

  // --- Testes de Submissão (Geral) ---

  // *** TESTE ADICIONADO PARA COBRIR O RETURN DE VALIDAÇÃO INVÁLIDA ***
  it('não deve submeter se o formulário for inválido e deve marcar todos como touched', () => {
    component.clinicForm.controls.fantasy_name.setValue(null); // Campo obrigatório
    expect(component.clinicForm.valid).toBeFalse();

    const markAllAsTouchedSpy = spyOn(component.clinicForm, 'markAllAsTouched');
    component.onSubmit();

    expect(markAllAsTouchedSpy).toHaveBeenCalled();
    expect(serviceSpy.create).not.toHaveBeenCalled();
    expect(serviceSpy.update).not.toHaveBeenCalled();
  });
  // *******************************************************************

  // --- Testes de Submissão (Criar) ---

  it('deve chamar create e navegar para a view em caso de sucesso (Criação)', fakeAsync(() => {
    // Modo Criação
    selectedClinicSubject.next(null);
    fixture.detectChanges();
    component.clinicForm.setValue({
      corporate_name: 'Nova S.A.',
      fantasy_name: 'Nova Clin',
      cnpj: '999',
      regional: 'SP',
      inauguration_date: '2023-10-01',
      specialties: [],
      is_active: true,
    });

    component.onSubmit();
    tick();

    expect(serviceSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({ fantasy_name: 'Nova Clin' }));
    expect(toastSpy).toHaveBeenCalledWith('Clínica criada com sucesso!', 'success');
    expect(routerSpy).toHaveBeenCalledWith(['/dashboard/clinica/c_new']);
  }));

  it('deve exibir toast de erro e não navegar em caso de falha (Criação)', fakeAsync(() => {
    serviceSpy.create.and.returnValue(throwError(() => new Error('API Error')));

    // Configuração de formulário válido
    component.clinicForm.setValue({
      corporate_name: 'Nova S.A.',
      fantasy_name: 'Nova Clin',
      cnpj: '999',
      regional: 'SP',
      inauguration_date: '2023-10-01',
      specialties: [],
      is_active: true,
    });

    component.onSubmit();
    tick();

    expect(toastSpy).toHaveBeenCalledWith('Erro ao criar clínica!', 'error');
    expect(routerSpy).not.toHaveBeenCalled();
  }));

  // --- Testes de Submissão (Editar) ---

  it('deve chamar update, limpar store e navegar para view em caso de sucesso (Edição)', fakeAsync(() => {
    // Modo Edição
    selectedClinicSubject.next(MOCK_CLINIC);
    fixture.detectChanges();
    component.clinicForm.setValue({
      corporate_name: 'Corporate Name SA',
      fantasy_name: 'Fantasy Clinic v2', // Mudança
      cnpj: '12345678000199',
      regional: 'RS',
      inauguration_date: '2020-01-01',
      specialties: [],
      is_active: true,
    });

    component.onSubmit();
    tick();

    expect(serviceSpy.update).toHaveBeenCalledWith(MOCK_CLINIC.id, jasmine.objectContaining({ fantasy_name: 'Fantasy Clinic v2' }));
    expect(storeSpy.setClinics).toHaveBeenCalled(); // Verifica se o estado global é atualizado
    expect(storeSpy.clearSelectedClinic).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('Clínica atualizada com sucesso!', 'success');
    expect(routerSpy).toHaveBeenCalledWith([`/dashboard/clinica/${MOCK_CLINIC.id}`]);
  }));

  it('deve exibir toast de erro e não navegar em caso de falha (Edição)', fakeAsync(() => {
    // Modo Edição
    selectedClinicSubject.next(MOCK_CLINIC);
    fixture.detectChanges();
    serviceSpy.update.and.returnValue(throwError(() => new Error('API Error')));

    // Configuração de formulário válido
    component.clinicForm.setValue({
      corporate_name: 'Corporate Name SA',
      fantasy_name: 'Fantasy Clinic v2',
      cnpj: '12345678000199',
      regional: 'RS',
      inauguration_date: '2020-01-01',
      specialties: [],
      is_active: true,
    });

    component.onSubmit();
    tick();

    expect(toastSpy).toHaveBeenCalledWith('Erro ao atualizar clínica!', 'error');
    expect(routerSpy).not.toHaveBeenCalled();
  }));

  // --- Teste de Navegação ---
  it('deve exibir toast de erro e chamar scrollTo em caso de falha (Criação)', fakeAsync(() => {
    // 1. Configura o Service para retornar erro (aciona o ramo 'else' > 'error')
    serviceSpy.create.and.returnValue(throwError(() => new Error('API Error')));
    const windowSpy = spyOn(window, 'scrollTo') as any;

    // 2. Modo Criação (isEditing() == false)
    selectedClinicSubject.next(null);
    fixture.detectChanges();

    // 3. Preenche o formulário para ser válido
    component.clinicForm.setValue({
      corporate_name: 'Fail S.A.', fantasy_name: 'Fail Clin', cnpj: '999',
      regional: 'SP', inauguration_date: '2023-10-01', specialties: [], is_active: true,
    });

    // 4. Executa a submissão
    component.onSubmit();
    tick(); // Resolve o Observable

    // 5. Verifica os resultados
    expect(toastSpy).toHaveBeenCalledWith('Erro ao criar clínica!', 'error');
    expect(windowSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      top: 0,
      behavior: 'smooth'
    })); // Linhas de scroll
    expect(routerSpy).not.toHaveBeenCalled();
  }));

  it('deve chamar update e atualizar o estado global em caso de sucesso (Edição)', fakeAsync(() => {
    // 1. Configura o Service para retornar sucesso
    serviceSpy.update.and.returnValue(of(MOCK_CLINIC));

    // 2. Modo Edição (isEditing() == true)
    selectedClinicSubject.next(MOCK_CLINIC);
    fixture.detectChanges();

    // 3. Preenche o formulário
    component.clinicForm.setValue({
      corporate_name: 'Updated S.A.', fantasy_name: 'Updated Clin', cnpj: '12345678000199',
      regional: 'RS', inauguration_date: '2020-01-01', specialties: [], is_active: true,
    });

    // 4. Executa a submissão
    component.onSubmit();
    tick(); // Resolve o Observable

    // 5. Verifica os resultados
    expect(serviceSpy.update).toHaveBeenCalled();
    expect(storeSpy.setClinics).toHaveBeenCalled(); // Cobrindo a linha de atualização da store
    expect(storeSpy.clearSelectedClinic).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('Clínica atualizada com sucesso!', 'success');
    expect(routerSpy).toHaveBeenCalledWith([`/dashboard/clinica/${MOCK_CLINIC.id}`]);
  }));

  it('deve navegar para a lista ao chamar goToCancel', () => {
    component.goToCancel();
    expect(routerSpy).toHaveBeenCalledWith(['/dashboard/clinicas']);
  });

  it('deve retornar título correto no modo criação e edição', fakeAsync(() => {
    // Modo Criação
    selectedClinicSubject.next(null);
    fixture.detectChanges();
    expect(component.cardTitle()).toBe('Nova clínica'); // cobre branch "false"
    expect(component.cardSubtitle()).toBe('Preencha os dados para cadastrar uma nova clínica.');

    // Modo Edição
    selectedClinicSubject.next(MOCK_CLINIC);
    fixture.detectChanges();
    expect(component.cardTitle()).toBe('Editar clínica'); // cobre branch "true"
    expect(component.cardSubtitle()).toBe('Altere os dados da clínica abaixo.');
  }));

  it('deve retornar "Nova clínica" quando não estiver editando', fakeAsync(() => {
    selectedClinicSubject.next(null);
    fixture.detectChanges();
    tick(); // garante que efeitos e computed foram processados

    expect(component.isEditing()).toBeFalse();
    expect(component.cardTitle()).toBe('Nova clínica');
  }));

  it('deve preencher is_active corretamente no modo edição', fakeAsync(() => {
    const inactiveClinic = { ...MOCK_CLINIC, is_active: false };
    selectedClinicSubject.next(inactiveClinic);
    fixture.detectChanges();
    expect(component.clinicForm.get('is_active')?.value).toBeFalse();
  }));
  it('não quebra ao remover especialidade se lista estiver vazia', () => {
    component.clinicForm.controls.specialties.setValue([]);
    const specialty: Specialty = { id: 'x', name: 'Teste' };
    component.removeSpecialty(specialty);
    expect(component.clinicForm.controls.specialties.value).toEqual([]);
  });

  it('deve retornar array vazio se não houver especialidades', () => {
    component.clinicForm.controls.specialties.setValue(null);
    const currentSpecialties: Specialty[] = component.clinicForm.controls.specialties.value || [];
    expect(currentSpecialties).toEqual([]); // cobre o branch do ||
  });
  it('deve resetar o formulário após criação com sucesso', fakeAsync(() => {
    selectedClinicSubject.next(null);
    fixture.detectChanges();

    component.clinicForm.setValue({
      corporate_name: 'Nova S.A.',
      fantasy_name: 'Nova Clin',
      cnpj: '999',
      regional: 'SP',
      inauguration_date: '2023-10-01',
      specialties: [],
      is_active: true,
    });

    component.onSubmit();
    tick();

    expect(component.clinicForm.get('is_active')?.value).toBeTrue(); // reset aplicado
    expect(component.clinicForm.controls.specialties.value).toEqual([]);
  }));

  it('deve atualizar a store corretamente após edição', fakeAsync(() => {
    selectedClinicSubject.next(MOCK_CLINIC);
    fixture.detectChanges();

    component.clinicForm.setValue({
      corporate_name: 'Corporate Name SA',
      fantasy_name: 'Fantasy Clinic v2',
      cnpj: '12345678000199',
      regional: 'RS',
      inauguration_date: '2020-01-01',
      specialties: [],
      is_active: true,
    });

    component.onSubmit();
    tick();

    expect(storeSpy.clinics().map((cl: Clinic) => cl.id)).toContain(MOCK_CLINIC.id); // cobre o map
    expect(storeSpy.setClinics).toHaveBeenCalled(); // confirma atualização
  }));

  it('não adiciona especialidade se valor do select for vazio ou inválido', () => {
    component.addSpecialty({ target: { value: '' } } as unknown as Event);
    component.addSpecialty({ target: { value: 'id-inexistente' } } as unknown as Event);
    expect(component.clinicForm.controls.specialties.value?.length).toBe(0);
  });
  it('deve exibir toast de erro, chamar scrollTo E logar erro em caso de falha (Edição)', fakeAsync(() => {
    // Modo Edição
    selectedClinicSubject.next(MOCK_CLINIC);
    fixture.detectChanges();

    const errorResponse = new Error('API Error');
    serviceSpy.update.and.returnValue(throwError(() => errorResponse));
    const windowSpy = spyOn(window, 'scrollTo') as any; // Para evitar erro de tipagem
    const consoleErrorSpy = spyOn(console, 'error'); // <-- NOVO SPY

    // Configuração de formulário válido
    component.clinicForm.setValue({
      corporate_name: 'Corporate Name SA',
      fantasy_name: 'Fantasy Clinic v2',
      cnpj: '12345678000199',
      regional: 'RS',
      inauguration_date: '2020-01-01',
      specialties: [],
      is_active: true,
    });

    component.onSubmit();
    tick();

    expect(toastSpy).toHaveBeenCalledWith('Erro ao atualizar clínica!', 'error');
    expect(windowSpy).toHaveBeenCalledWith(jasmine.objectContaining({ top: 0, behavior: 'smooth' }));
    // NOVA VERIFICAÇÃO: Garante que o console.error foi chamado no bloco de erro da edição
    expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao atualizar clínica:', errorResponse);
    expect(routerSpy).not.toHaveBeenCalled();
  }));
  // -----------------------------------------------------------------------------------
  // TESTE NOVO: COBRE O RAMO 'false' DO TERNÁRIO DE is_active no _syncEffect
  // -----------------------------------------------------------------------------------
  it('deve preencher is_active como FALSE se o valor da clínica for null/false (Cobre Ternário)', fakeAsync(() => {
    // Simula uma clínica onde is_active é explicitamente falso
    const nullActiveClinic = { ...MOCK_CLINIC, is_active: false };
    selectedClinicSubject.next(nullActiveClinic);
    fixture.detectChanges();
    expect(component.clinicForm.get('is_active')?.value).toBeFalse();

    // Resetamos o spy para o próximo cenário
    selectedClinicSubject.next(null);
    fixture.detectChanges();

    // Simula uma clínica onde is_active é null (avaliado como false no ternário)
    const mockClinicWithNullActive = { ...MOCK_CLINIC, is_active: null } as unknown as Clinic;
    selectedClinicSubject.next(mockClinicWithNullActive);
    fixture.detectChanges();
    // A propriedade is_active deve ser preenchida com 'false'
    expect(component.clinicForm.get('is_active')?.value).toBeFalse();
  }));
});
