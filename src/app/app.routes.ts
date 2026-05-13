import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
import { AuthLayout } from './layout/auth-layout/auth-layout'; 
import { MainLayoutComponent } from './layout/main-layout/main-layout'; 
// import { roleGuard } from './core/auth/role.guard'; // Lo crearemos luego

export const routes: Routes = [
 // RUTA DE LOGIN (Usa el AuthLayout sin sidebar)
  { 
    path: '', 
    component: AuthLayout, 
    children: [
      { 
        path: 'login', 
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login) 
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // RUTAS PROTEGIDAS (Usa el MainLayout con Sidebar y Topbar)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard) 
      },
      // futuras features: agents, users, etc.
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

  // REDIRECCIONES GLOBALES
  { path: '**', redirectTo: 'login' }
];
     
 