import { Component, Input, Output, EventEmitter, HostListener, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário para ngIf

interface DropdownItem {
  label: string;
  value: any;
  icon?: string; // Opcional, para ícones
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  private elementRef = inject(ElementRef);

  @Input() buttonLabel: string = 'Opções';
  @Input() items: DropdownItem[] = [
    { label: 'Item 1', value: 1 },
    { label: 'Item 2', value: 2 },
    { label: 'Item 3', value: 3 }
  ];
  @Output() itemSelected = new EventEmitter<DropdownItem>();

  isOpen = false;

  // Alterna o estado do dropdown
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  // Lógica ao selecionar um item
  selectItem(item: DropdownItem) {
    this.itemSelected.emit(item);
    this.isOpen = false; // Fecha o menu após a seleção
  }

  // Fecha o dropdown ao clicar fora do componente
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    // 1. Verifique se o evento de clique não ocorreu DENTRO do elemento nativo deste componente
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }
}
