import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService, ToastType } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // O serviço é 'providedIn: root', então o Angular o gerencia
      providers: [ToastService],
    });
    service = TestBed.inject(ToastService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  // Teste 1: Adicionar uma toast e verificar o estado do signal
  it('deve adicionar uma nova toast ao signal "toasts"', () => {
    const message = 'Ação realizada com sucesso!';
    const type: ToastType = 'success';

    expect(service.toasts().length).toBe(0);

    service.show(message, type);

    // Verifica se a toast foi adicionada
    expect(service.toasts().length).toBe(1);
    const addedToast = service.toasts()[0];

    // Verifica conteúdo e tipo
    expect(addedToast.message).toBe(message);
    expect(addedToast.type).toBe(type);

    // Verifica se o contador foi incrementado (o primeiro ID deve ser 1)
    expect(addedToast.id).toBe(1);
  });

  // Teste 2: Verificar a remoção da toast após a duração padrão (3000ms)
  it('deve remover a toast após a duração padrão de 3000ms', fakeAsync(() => {
    service.show('Toast a ser removida', 'info');
    expect(service.toasts().length).toBe(1);

    // Avança o tempo do relógio virtual em 2999ms (a toast ainda deve estar lá)
    tick(2999);
    expect(service.toasts().length).toBe(1);

    // Avança mais 1ms (totalizando 3000ms)
    tick(1);

    // A toast deve ter sido removida pelo setTimeout
    expect(service.toasts().length).toBe(0);
  }));

  // Teste 3: Verificar a remoção com uma duração customizada
  it('deve remover a toast após uma duração customizada', fakeAsync(() => {
    const customDuration = 5000;
    service.show('Toast customizada', 'error', customDuration);

    expect(service.toasts().length).toBe(1);

    // Avança o tempo até o limite (4999ms)
    tick(customDuration - 1);
    expect(service.toasts().length).toBe(1);

    // Avança para o tempo de remoção (5000ms)
    tick(1);
    expect(service.toasts().length).toBe(0);
  }));

  // Teste 4: Assegurar que múltiplos toasts são tratados independentemente
  it('deve gerenciar múltiplas toasts com diferentes durações de forma independente', fakeAsync(() => {
    service.show('Toast 1 (Padrão: 3s)', 'success'); // ID 1
    service.show('Toast 2 (Custom: 5s)', 'error', 5000); // ID 2
    service.show('Toast 3 (Curta: 1s)', 'info', 1000); // ID 3

    expect(service.toasts().length).toBe(3);

    // 1. Avança 1000ms: Toast 3 deve sair (3 - 1 = 2)
    tick(1000);
    expect(service.toasts().length).toBe(2);
    expect(service.toasts().some(t => t.id === 3)).toBeFalse();

    // 2. Avança mais 2000ms (Total: 3000ms): Toast 1 deve sair (2 - 1 = 1)
    tick(2000);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts().some(t => t.id === 1)).toBeFalse();

    // 3. Avança mais 2000ms (Total: 5000ms): Toast 2 deve sair (1 - 1 = 0)
    tick(2000);
    expect(service.toasts().length).toBe(0);
    expect(service.toasts().some(t => t.id === 2)).toBeFalse();
  }));

  // Teste 5: Verificar a atribuição correta do tipo padrão ('success')
  it('deve usar "success" como tipo padrão se não for fornecido', fakeAsync(() => {
    service.show('Mensagem padrão');

    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].type).toBe('success');

    tick(3000);
  }));
});
