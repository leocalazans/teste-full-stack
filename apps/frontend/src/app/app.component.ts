import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
      <main>
          <router-outlet></router-outlet>
      </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // 🔹 Signal para autenticação (poderia vir de AuthService)
  private authSignal = signal<boolean>(false);

  isAuthenticated = this.authSignal.asReadonly();

  logout() {
    // Aqui você vai limpar o JWT armazenado (ex.: cookie HttpOnly via backend)
    this.authSignal.set(false);
  }
}
