import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  title = input<string>('Título Padrão');
  content = input<string>('Conteúdo Padrão do Cartão.');
}
