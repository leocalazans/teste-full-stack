import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Inicializa o componente
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // --- Teste de Visibilidade (Input) ---

  it('should be invisible by default (isOpen=false)', () => {
    component.isOpen = false;
    fixture.detectChanges();
    // O modal deve estar oculto, mas isso geralmente é controlado via CSS.
    // Para um teste funcional, assumimos que o pai controla a exibição.
    expect(component.isOpen).toBeFalse();
  });

  it('should be visible when isOpen is true', () => {
    component.isOpen = true;
    fixture.detectChanges();
    expect(component.isOpen).toBeTrue();
  });

  // --- Teste do Evento de Fechamento (Output) ---

  it('should emit the close event when handleClose is called', () => {
    // 1. Espiona o evento 'close'
    spyOn(component.close, 'emit');

    // 2. Chama o método de fechar
    component.handleClose();

    // 3. Verifica se o evento foi emitido
    expect(component.close.emit).toHaveBeenCalled();
  });

  // --- Testes de Lógica de Fechamento por Backdrop ---

  it('should call handleClose if handleBackdropClick is triggered on the current target', () => {
    // 1. Espiona o método handleClose
    spyOn(component, 'handleClose');

    // 2. Cria um evento de clique onde o alvo do evento é o elemento atual (o backdrop em si)
    const mockEvent = {
      target: fixture.nativeElement, // O alvo é o elemento
      currentTarget: fixture.nativeElement, // O elemento atual é o alvo (clique no fundo)
    } as unknown as MouseEvent;

    component.handleBackdropClick(mockEvent);

    // 3. Verifica se a função de fechar foi chamada
    expect(component.handleClose).toHaveBeenCalled();
  });

  it('should NOT call handleClose if handleBackdropClick is triggered on a child element (modal content)', () => {
    // 1. Espiona o método handleClose
    spyOn(component, 'handleClose');

    // 2. Cria um evento onde o alvo (target) é um elemento interno
    // e o currentTarget é o backdrop. Isso simula o clique no conteúdo do modal.
    const mockChildElement = document.createElement('div');
    const mockEvent = {
      target: mockChildElement, // Clicou no conteúdo
      currentTarget: fixture.nativeElement, // Mas o listener está no backdrop
    } as unknown as MouseEvent;

    component.handleBackdropClick(mockEvent);

    // 3. Verifica se a função de fechar NÃO foi chamada
    expect(component.handleClose).not.toHaveBeenCalled();
  });
});
