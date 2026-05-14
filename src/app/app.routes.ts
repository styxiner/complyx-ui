import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
import { roleGuard } from './core/auth/role-guard';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { MainLayoutComponent } from './layout/main-layout/main-layout';

export const routes: Routes = [

  // ── Rutas públicas (sin sidebar) ─────────────────────────────────────────
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login').then((m) => m.Login),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ── Rutas protegidas (con sidebar) ────────────────────────────────────────
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard('ADMIN', 'TECNICO')],
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'agents',
        canActivate: [roleGuard('ADMIN', 'TECNICO')],
        loadComponent: () =>
          import('./features/agents/agent-list/agent-list').then((m) => m.AgentList),
      },
      {
        path: 'policies',
        canActivate: [roleGuard('ADMIN', 'TECNICO')],
        loadComponent: () =>
          import('./features/policies/policy-list/policy-list').then((m) => m.PolicyList),
      },
      {
        path: 'risks',
        canActivate: [roleGuard('ADMIN', 'TECNICO')],
        loadComponent: () =>
          import('./features/risks/risk-matrix/risk-matrix').then((m) => m.RiskMatrix),
      },
      {
        path: 'regulations',
        canActivate: [roleGuard('ADMIN', 'TECNICO')],
        loadComponent: () =>
          import('./features/regulations/regulation-list/regulation-list').then((m) => m.RegulationList),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/events/event-list/event-list').then((m) => m.EventList),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/report-builder/report-builder').then((m) => m.ReportBuilder),
      },
      {
        path: 'users',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./features/users/user-list/user-list').then((m) => m.UserList),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile/profile').then((m) => m.Profile),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];