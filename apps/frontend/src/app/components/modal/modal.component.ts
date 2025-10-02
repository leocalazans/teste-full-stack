// src/app/shared/modal/modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  // 1. Estado de Visibilidade (Controlado pelo pai ou serviço)
  @Input() isOpen = false;

  // 2. Evento para Fechar o Modal
  @Output() close = new EventEmitter<void>();

  // 3. Propriedades de Acessibilidade
  @Input() titleId: string = 'modal-title';
  @Input() descriptionId: string = 'modal-description';

  // 4. Ações
  handleClose(): void {
    // Emite o evento para o componente pai
    this.close.emit();
  }

  handleBackdropClick(event: MouseEvent): void {
    // Fecha apenas se o clique for exatamente no overlay (fundo)
    if (event.target === event.currentTarget) {
      this.handleClose();
    }
  }
}
