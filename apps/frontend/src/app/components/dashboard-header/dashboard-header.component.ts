import {
  Component,
  signal,
  inject,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../features/auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop'
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeaderComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Signal baseado no observable do AuthService
  currentUser = toSignal<User | null>(this.auth.currentUser$, { initialValue: null });

  private elementRef = inject(ElementRef);
  isProfileMenuOpen = signal(false);

  openProfileMenu(): void {
    this.isProfileMenuOpen.update((value) => !value);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isProfileMenuOpen.set(false);
    }
  }

  preventClose(event: Event): void {
    event.stopPropagation();
  }

  goToProfile(): void {
    console.log('Navegar para Perfil');
    this.isProfileMenuOpen.set(false);
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        console.log('Logout realizado');
        // Aqui você pode navegar para login, por exemplo:
        this.router.navigate(['/']);
      },
      error: err => {
        console.error('Erro ao fazer logout', err);
      }
    });
  }
}
