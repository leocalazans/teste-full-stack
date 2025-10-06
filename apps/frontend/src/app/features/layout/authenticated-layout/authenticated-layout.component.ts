import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../toast/toast.service';
import { DashboardHeaderComponent } from '../../../components/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, DashboardHeaderComponent],
  templateUrl: './authenticated-layout.component.html',
  styleUrl: './authenticated-layout.component.css'
})
export class AuthenticatedLayoutComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;
}
