import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { ClinicasComponent } from './clinicas.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// ######################################################################
// 1. MOCK COMPONENT PARA ISOLAMENTO
// O DropdownComponent é substituído por um mock para isolar o ClinicasComponent
// e testar apenas sua lógica (incluindo o Output itemSelected).
// ######################################################################

@Component({
  selector: 'app-dropdown',
  standalone: true,
  // Usa ng-content para simular a Content Projection do botão de acionamento
  template: '<div (click)="simulateClick()"><ng-content></ng-content></div>',
})
class MockDropdownComponent {
  @Input() items: any[] = [];
  // O componente pai (ClinicasComponent) espera este Output
  @Output() itemSelected = new EventEmitter<any>();

  // Método auxiliar para simular uma seleção de item durante o teste
  simulateSelection(item: any) {
    this.itemSelected.emit(item);
  }

  // Método auxiliar para simular o clique no gatilho (útil para testes futuros de isOpen)
  simulateClick() {
    // Aqui, podemos simular a abertura/fechamento se necessário.
    // Por enquanto, apenas o Output 'itemSelected' é crucial.
  }
}

// ######################################################################
// 2. SETUP DO TESTE
// ######################################################################

describe('ClinicasComponent', () => {
  let component: ClinicasComponent;
  let fixture: ComponentFixture<ClinicasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule, // Necessário para o [(ngModel)]
        ClinicasComponent, // Componente real sendo testado
      ],
      // O provider abaixo foi deixado para referência, mas não é usado
      // para substituir o componente, apenas o overrideComponent faz isso.
      providers: [
        { provide: 'app-dropdown', useValue: MockDropdownComponent },
      ],
    })
      .overrideComponent(ClinicasComponent, {
        // CORREÇÃO: Usamos 'as any' para contornar o erro de TypeScript
        // ao acessar a propriedade de metadados interna (ɵcmp).
        remove: { imports: [(ClinicasComponent as any).ɵcmp.imports.find((i: any) => i.name === 'DropdownComponent')] },
        add: { imports: [MockDropdownComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ClinicasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Inicializa o componente
  });

  // ######################################################################
  // 3. TESTES DE SINAIS E INICIALIZAÇÃO
  // ######################################################################

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar 7 clínicas iniciais', () => {
    expect(component.clinics().length).toBe(7);
  });

  it('deve calcular o total de páginas corretamente (7 itens, 5 por página)', () => {
    // 7 itens / 5 por página = 1.4 -> Math.ceil(1.4) = 2 páginas
    expect(component.totalPages()).toBe(2);
  });

  // ######################################################################
  // 4. TESTES DE FILTRAGEM (BUSCA)
  // ######################################################################

  it('deve filtrar os dados baseando-se no termo de busca (fantasyName)', () => {
    component.searchTerm.set('sorriso');
    // A filtragem é feita por computed, então é imediata.
    expect(component.sortedAndFilteredData().length).toBe(1);
    expect(component.sortedAndFilteredData()[0].fantasyName).toBe('Clínica Sorriso');
  });

  it('deve filtrar os dados baseando-se no termo de busca (corporateName ou CNPJ)', () => {
    component.searchTerm.set('AMI'); // Busca 'AMI Saúde'
    expect(component.sortedAndFilteredData().length).toBe(1);
    expect(component.sortedAndFilteredData()[0].fantasyName).toBe('AMI Saúde');

    component.searchTerm.set('77.888'); // Busca pelo CNPJ de 'AMI Saúde'
    expect(component.sortedAndFilteredData().length).toBe(1);
    expect(component.sortedAndFilteredData()[0].fantasyName).toBe('AMI Saúde');
  });

  it('deve limpar a busca e resetar a paginação', () => {
    component.searchTerm.set('visão');
    component.currentPage.set(2);

    component.clearSearch();

    expect(component.searchTerm()).toBe('');
    expect(component.currentPage()).toBe(1);
    expect(component.sortedAndFilteredData().length).toBe(7);
  });

  // ######################################################################
  // 5. TESTES DE ORDENAÇÃO
  // ######################################################################

  it('deve inicializar com a ordenação por data de inauguração descendente', () => {
    // 'desc' é a direção padrão para datas
    expect(component.sortState().column).toBe('inauguration');
    expect(component.sortState().direction).toBe('desc');
    // A primeira clínica deve ser a mais nova: FisioTotal (22/04/2023)
    expect(component.sortedAndFilteredData()[0].fantasyName).toBe('FisioTotal');
  });

  it('deve inverter a direção da ordenação ao clicar na mesma coluna', () => {
    // Inverte de 'desc' para 'asc'
    component.toggleSort('inauguration');
    expect(component.sortState().direction).toBe('asc');

    // A primeira clínica deve ser a mais antiga: CardioMais (05/11/2017)
    expect(component.sortedAndFilteredData()[0].fantasyName).toBe('CardioMais');
  });

  it('deve mudar a coluna de ordenação e definir a direção para ascendente (padrão para strings)', () => {
    component.toggleSort('fantasyName');

    expect(component.sortState().column).toBe('fantasyName');
    expect(component.sortState().direction).toBe('asc');

    // O primeiro nome em ordem alfabética é 'AMI Saúde'
    expect(component.sortedAndFilteredData()[0].fantasyName).toBe('AMI Saúde');
  });

  it('deve resetar a paginação para a página 1 após a ordenação', () => {
    component.currentPage.set(2);
    component.toggleSort('fantasyName');

    expect(component.currentPage()).toBe(1);
  });

  // ######################################################################
  // 6. TESTES DE PAGINAÇÃO
  // ######################################################################

  it('deve ir para a próxima página e desabilitar se for a última', () => {
    // Início: Página 1 (Pode ir para a 2)
    component.nextPage();
    expect(component.currentPage()).toBe(2);

    // Fim: Página 2 (Não pode ir além)
    component.nextPage();
    expect(component.currentPage()).toBe(2);
  });

  it('deve ir para a página anterior e desabilitar se for a primeira', () => {
    component.currentPage.set(2);

    // Página 2 -> Página 1
    component.prevPage();
    expect(component.currentPage()).toBe(1);

    // Página 1 (Não pode ir aquém)
    component.prevPage();
    expect(component.currentPage()).toBe(1);
  });

  it('deve retornar o slice correto de dados na segunda página', () => {
    component.currentPage.set(2);

    const paginated = component.paginatedClinics();

    // Total de 7, 5 na primeira página, 2 na segunda.
    expect(paginated.length).toBe(2);

    // Baseado na ordenação inicial (inauguration desc), o sexto item é 'Bem Estar'
    expect(paginated[0].fantasyName).toBe('Bem Estar');
  });

  // ######################################################################
  // 7. TESTES DE INTERAÇÃO DO TEMPLATE
  // ######################################################################

  it('deve exibir o número correto de linhas na tabela (5 na primeira página)', () => {
    fixture.detectChanges();
    // Verifica apenas as linhas de dados (tr dentro do tbody)
    const dataRows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(dataRows.length).toBe(5);
  });

  it('deve exibir a mensagem de "Nenhuma clínica encontrada" quando a busca não retornar resultados', () => {
    component.searchTerm.set('XYZ Inexistente');
    fixture.detectChanges();

    const noResultsRow = fixture.debugElement.query(By.css('tr.border-b-0 td[colspan="6"]'));
    expect(noResultsRow.nativeElement.textContent).toContain('Nenhuma clínica encontrada.');
  });

  it('deve chamar onItemSelected ao selecionar item no dropdown', () => {
    spyOn(component, 'onItemSelected').and.callThrough(); // Monitora o método
    fixture.detectChanges();

    // Encontra a primeira instância do MockDropdownComponent (primeira linha da tabela)
    const dropdownDebugElement = fixture.debugElement.query(By.directive(MockDropdownComponent));
    const mockDropdownInstance = dropdownDebugElement.componentInstance as MockDropdownComponent;

    const testItem = { label: 'Ver', value: 'ver' };

    // Simula a emissão do evento itemSelected pelo mock
    mockDropdownInstance.simulateSelection(testItem);

    // Verifica se o método do componente pai foi chamado
    expect(component.onItemSelected).toHaveBeenCalled();

    // Verifica se o método foi chamado com o item correto E o ID (fantasyName) da clínica
    const firstClinicName = component.paginatedClinics()[0].fantasyName;
    expect(component.onItemSelected).toHaveBeenCalledWith(testItem, firstClinicName);

    // Verifica o estado atualizado
    expect(component.selectedItemLabel).toBe('Ver');
  });

  it('deve ter o ícone de ordenação visível e rotacionado corretamente', () => {
    component.sortState.set({ column: 'inauguration', direction: 'asc' });
    fixture.detectChanges();

    // Encontra o ícone de ordenação na coluna 'Inauguração'
    const sortIcon = fixture.debugElement.query(By.css('th svg'));

    expect(sortIcon).toBeTruthy();
    // Na direção 'asc', o ícone não deve estar rotacionado (classe rotate-180 ausente)
    expect(sortIcon.nativeElement.classList.contains('rotate-180')).toBeFalse();

    component.sortState.set({ column: 'inauguration', direction: 'desc' });
    fixture.detectChanges();

    // Na direção 'desc', o ícone deve estar rotacionado (classe rotate-180 presente)
    expect(sortIcon.nativeElement.classList.contains('rotate-180')).toBeTrue();
  });
});
