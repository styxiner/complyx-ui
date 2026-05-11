import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
// import { roleGuard } from './core/auth/role.guard'; // Lo crearemos luego

export const routes: Routes = [
  // RUTA DE LOGIN
  { 
    path: 'login', 
    // component: AuthLayoutComponent, // Comentado hasta que exista el Layout
    children: [
      { 
        path: '', 
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login) 
      }
    ]
  },

  // RUTAS PROTEGIDAS (Requieren estar logueado)
  {
    path: '',
    // component: MainLayoutComponent, // Comentado hasta que exista el Layout
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard) 
      },
      /* 
      { 
        path: 'agents', 
        canActivate: [roleGuard('TECNICO')], 
        loadComponent: () => import('./features/agents/agents-list/agents-list.component').then(m => m.AgentsListComponent) 
      },
      { 
        path: 'users', 
        canActivate: [roleGuard('ADMIN')], 
        loadComponent: () => import('./features/users/users-list/users-list.component').then(m => m.UsersListComponent) 
      },
      */
    ]
  },

  // REDIRECCIONES
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];