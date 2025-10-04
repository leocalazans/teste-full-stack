// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { AuthenticatedLayoutComponent } from './features/layout/authenticated-layout/authenticated-layout.component'; // ⬅️ Importe o novo layout
import { clinicaResolver } from './features/clinicas/clinicas.resolver';
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
      { path: 'clinicas', loadComponent: () => import('./features/clinicas/clinicas-list/clinicas-list.component').then(m => m.ClinicasListComponent) },
      {
        path: 'clinicas/adicionar',
        loadComponent: () => import('./features/clinicas/clinicas-form/clinicas-form.component')
          .then(m => m.ClinicasFormComponent)
      },
      {
        path: 'clinica/:id',
        loadComponent: () => import('./features/clinicas/clinicas-view/clinicas-view.component')
          .then(m => m.ClinicasViewComponent),
        resolve: { clinic: clinicaResolver }
      },
      {
        path: 'clinica/editar/:id',
        loadComponent: () => import('./features/clinicas/clinicas-form/clinicas-form.component')
          .then(m => m.ClinicasFormComponent),
        resolve: { clinic: clinicaResolver }
      },
    ]
  },
  // { path: '**', redirectTo: 'dashboard' }
];

// { path: '', redirectTo: 'clinics', pathMatch: 'full' },
// { path: 'clinics/:id', loadComponent: () => import('./features/clinics/clinic-view.component').then(m => m.ClinicViewComponent) },
// { path: 'clinics/:id/edit', loadComponent: () => import('./features/clinics/clinic-form.component').then(m => m.ClinicFormComponent) },
