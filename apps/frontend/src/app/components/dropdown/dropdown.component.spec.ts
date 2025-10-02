import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DropdownComponent } from './dropdown.component';
import { Component, ElementRef } from '@angular/core';

// Definimos uma interface mockada para o item, baseada na interface real
interface MockDropdownItem {
  label: string;
  value: any;
  icon?: string;
}

// ######################################################################
// 1. COMPONENTE HOST DE TESTE
// É necessário um Host Component para testar o Content Projection (<ng-content>)
// e simular cliques fora do componente Dropdown.
// ######################################################################

@Component({
  template: `
    <!-- Host para o Dropdown Component, projetando um botão simples como gatilho -->
    <div id="host-element">
      <app-dropdown [items]="testItems" (itemSelected)="onItemSelected($event)">
        <button id="toggle-button">Menu</button>
      </app-dropdown>
    </div>
    <!-- Elemento externo para simular o clique fora -->
    <button id="outside-button">Fora</button>
  `,
  standalone: true,
  imports: [DropdownComponent],
})
class TestHostComponent {
  testItems: MockDropdownItem[] = [
    { label: 'Ação 1', value: 'a1' },
    { label: 'Ação 2', value: 'a2' },
  ];
  selectedItem: MockDropdownItem | null = null;
  onItemSelected(item: MockDropdownItem) {
    this.selectedItem = item;
  }
}

// ######################################################################
// 2. SETUP DO TESTE
// ######################################################################

describe('DropdownComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let dropdownDebugElement: any;
  let dropdownComponent: DropdownComponent;

  // Variável para simular o ElementRef injetado no componente
  let elementRefMock: ElementRef;

  beforeEach(async () => {
    // Cria um mock para o ElementRef que o componente injeta
    elementRefMock = new ElementRef(document.createElement('div'));

    await TestBed.configureTestingModule({
      imports: [DropdownComponent, TestHostComponent],
      providers: [
        // Força o componente a usar nosso mock de ElementRef para isolar o teste
        { provide: ElementRef, useValue: elementRefMock },
      ],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;

    // Encontra o componente Dropdown aninhado no Host
    dropdownDebugElement = hostFixture.debugElement.query(By.directive(DropdownComponent));
    dropdownComponent = dropdownDebugElement.componentInstance;

    hostFixture.detectChanges(); // Inicializa o componente
  });

  // ######################################################################
  // 3. TESTES DE ESTADO E LÓGICA DE CLIQUE (toggleDropdown, selectItem)
  // ######################################################################

  it('deve criar o componente', () => {
    expect(dropdownComponent).toBeTruthy();
  });

  it('deve iniciar fechado (isOpen = false)', () => {
    expect(dropdownComponent.isOpen).toBeFalse();
    // Verifica se o menu DIV não está no DOM
    const menuElement = hostFixture.debugElement.query(By.css('.absolute'));
    expect(menuElement).toBeNull();
  });

  it('deve alternar o estado de isOpen ao chamar toggleDropdown()', () => {
    dropdownComponent.toggleDropdown();
    expect(dropdownComponent.isOpen).toBeTrue();

    dropdownComponent.toggleDropdown();
    expect(dropdownComponent.isOpen).toBeFalse();
  });

  it('deve abrir o menu ao clicar no gatilho', () => {
    // Gatilho é o <span> que envolve <ng-content>
    const triggerSpan = dropdownDebugElement.query(By.css('span.cursor-pointer'));

    triggerSpan.nativeElement.click();
    hostFixture.detectChanges();

    expect(dropdownComponent.isOpen).toBeTrue();
    // Verifica se o menu DIV está visível
    const menuElement = hostFixture.debugElement.query(By.css('.absolute'));
    expect(menuElement).toBeTruthy();
  });

  it('deve emitir o item selecionado e fechar o menu ao chamar selectItem()', () => {
    spyOn(dropdownComponent.itemSelected, 'emit');
    dropdownComponent.isOpen = true; // Abre artificialmente para testar o fechamento
    const itemToSelect = dropdownComponent.items[1];

    dropdownComponent.selectItem(itemToSelect);

    // 1. Deve emitir o item
    expect(dropdownComponent.itemSelected.emit).toHaveBeenCalledWith(itemToSelect);
    // 2. Deve fechar o menu
    expect(dropdownComponent.isOpen).toBeFalse();
  });

  it('deve emitir o item e fechar o menu ao clicar em um item do menu', () => {
    spyOn(dropdownComponent.itemSelected, 'emit');
    dropdownComponent.isOpen = true;
    hostFixture.detectChanges();

    // Encontra o link (a) do segundo item ('Item 2')
    const menuItemElements = hostFixture.debugElement.queryAll(By.css('.py-1 a'));

    expect(menuItemElements.length).toBe(3);
    menuItemElements[1].nativeElement.click(); // Clica no 'Item 2'

    // Verifica a emissão e o fechamento no componente Host
    expect(hostComponent.selectedItem?.label).toBe('Item 2');
    expect(dropdownComponent.isOpen).toBeFalse();
  });

  // ######################################################################
  // 4. TESTES DO HOSTLISTENER (clickOutside)
  // ######################################################################

  it('deve fechar o menu quando o clique é FORA do componente', fakeAsync(() => {
    dropdownComponent.isOpen = true; // Abre o menu
    hostFixture.detectChanges();

    // Simula o clique fora, no botão 'outside-button'
    const outsideButton = hostFixture.debugElement.query(By.css('#outside-button'));
    outsideButton.nativeElement.click();

    tick(); // Processa eventos assíncronos (o HostListener)

    expect(dropdownComponent.isOpen).toBeFalse();
  }));

  it('NÃO deve fechar o menu quando o clique é DENTRO do componente (no toggle)', fakeAsync(() => {
    dropdownComponent.isOpen = true; // Abre o menu
    hostFixture.detectChanges();

    // Simula o clique DENTRO do componente (no botão que está no <ng-content>)
    const toggleButton = hostFixture.debugElement.query(By.css('#toggle-button'));

    // Dispara o evento de clique no elemento nativo que está DENTRO do DropdownComponent
    toggleButton.nativeElement.click();

    tick(); // Processa eventos assíncronos

    // O toggleDropdown já foi chamado e fechou/abriu. Aqui verificamos se o clickOutside
    // não interfere (neste caso, o click no toggle chama toggleDropdown,
    // então ele deve permanecer aberto/fechado conforme a lógica do toggle).

    // Para testar *apenas* o clickOutside, precisamos simular um clique interno sem o (click)="toggleDropdown()"

    // Simulação do HostListener:
    // 1. Abrir o menu
    dropdownComponent.isOpen = true;
    hostFixture.detectChanges();

    // 2. Simular um clique DENTRO do elemento nativo do Dropdown (HostListener é chamado)
    dropdownDebugElement.nativeElement.click(); // Clica no host do Dropdown

    tick();

    // Deve permanecer aberto, pois o clique foi DENTRO do componente
    expect(dropdownComponent.isOpen).toBeTrue();
  }));
});
