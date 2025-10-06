import { Routes } from '@angular/router';
import { routes } from './app.routes'; // Importa a configuração de rotas
import { AuthGuard } from './core/auth.guard';
import { AuthenticatedLayoutComponent } from './features/layout/authenticated-layout/authenticated-layout.component';
import { clinicaResolver } from './features/clinicas/clinicas.resolver';

// Funções utilitárias para importar os componentes e verificar suas referências
// Isso simula o lazy-loading sem carregar o módulo inteiro
const getDashboardComponent = async () => (await import('./features/dashboard/dashboard.component')).DashboardComponent;
const getLoginComponent = async () => (await import('./features/login/login.component')).LoginComponent;
const getClinicasListComponent = async () => (await import('./features/clinicas/clinicas-list/clinicas-list.component')).ClinicasListComponent;
const getClinicasFormComponent = async () => (await import('./features/clinicas/clinicas-form/clinicas-form.component')).ClinicasFormComponent;
const getClinicasViewComponent = async () => (await import('./features/clinicas/clinicas-view/clinicas-view.component')).ClinicasViewComponent;


describe('Application Routes Configuration', () => {

  const authenticatedRoutes = routes.find(r => r.path === 'dashboard');

  it('should define the default route (/) pointing to Login', async () => {
    const defaultRoute = routes[0];
    expect(defaultRoute.path).toBe('');

    // Testa se o lazy-load aponta para o componente correto
    const loadedComponent = await defaultRoute.loadComponent!();
    expect(loadedComponent).toBe(await getLoginComponent());
  });

  it('should have a main "dashboard" route guarded by AuthGuard', () => {
    expect(authenticatedRoutes).toBeTruthy();
    expect(authenticatedRoutes!.path).toBe('dashboard');
    expect(authenticatedRoutes!.component).toBe(AuthenticatedLayoutComponent);
    expect(authenticatedRoutes!.canActivate).toEqual([AuthGuard]);
    expect(authenticatedRoutes!.children).toBeDefined();
  });

  describe('Dashboard Children Routes', () => {
    const children: Routes = authenticatedRoutes!.children || [];

    it('should have a root route (dashboard/) pointing to DashboardComponent', async () => {
      const dashboardRoot = children.find(c => c.path === '');
      expect(dashboardRoot).toBeTruthy();

      const loadedComponent = await dashboardRoot!.loadComponent!();
      expect(loadedComponent).toBe(await getDashboardComponent());
    });

    it('should have a route for "clinicas" pointing to ClinicasListComponent', async () => {
      const clinicasList = children.find(c => c.path === 'clinicas');
      expect(clinicasList).toBeTruthy();

      const loadedComponent = await clinicasList!.loadComponent!();
      expect(loadedComponent).toBe(await getClinicasListComponent());
    });

    it('should have a route for "clinicas/adicionar" pointing to ClinicasFormComponent', async () => {
      const clinicasAdd = children.find(c => c.path === 'clinicas/adicionar');
      expect(clinicasAdd).toBeTruthy();

      const loadedComponent = await clinicasAdd!.loadComponent!();
      expect(loadedComponent).toBe(await getClinicasFormComponent());
    });

    it('should have a route for "clinica/:id" with the clinicaResolver', async () => {
      const clinicaView = children.find(c => c.path === 'clinica/:id');
      expect(clinicaView).toBeTruthy();

      const loadedComponent = await clinicaView!.loadComponent!();
      expect(loadedComponent).toBe(await getClinicasViewComponent());

      // Verifica se o resolver está corretamente anexado
      expect(clinicaView!.resolve!['clinic']).toBe(clinicaResolver);
    });

    it('should have a route for "clinica/editar/:id" with the clinicaResolver', async () => {
      const clinicaEdit = children.find(c => c.path === 'clinica/editar/:id');
      expect(clinicaEdit).toBeTruthy();

      const loadedComponent = await clinicaEdit!.loadComponent!();
      expect(loadedComponent).toBe(await getClinicasFormComponent());

      // Verifica se o resolver está corretamente anexado
      expect(clinicaEdit!.resolve!['clinic']).toBe(clinicaResolver);
    });
  });
});
