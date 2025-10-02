// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { AuthenticatedLayoutComponent } from './features/layout/authenticated-layout/authenticated-layout.component'; // ⬅️ Importe o novo layout

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    component: AuthenticatedLayoutComponent,
    // component: AuthenticatedLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      { path: 'clinicas', loadComponent: () => import('./features/clinicas/clinicas.component').then(m => m.ClinicasComponent) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

// { path: '', redirectTo: 'clinics', pathMatch: 'full' },
// { path: 'clinics/new', loadComponent: () => import('./features/clinics/clinic-form.component').then(m => m.ClinicFormComponent) },
// { path: 'clinics/:id', loadComponent: () => import('./features/clinics/clinic-view.component').then(m => m.ClinicViewComponent) },
// { path: 'clinics/:id/edit', loadComponent: () => import('./features/clinics/clinic-form.component').then(m => m.ClinicFormComponent) },
