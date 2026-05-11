import { Routes } from '@angular/router';

export const routes: Routes = [];


// export const routes: Routes = [
//   { path: 'login', component: AuthLayoutComponent,
//     children: [{ path: '', loadComponent: () => import('./features/auth/login/login.component') }]
//   },
//   { path: '', component: MainLayoutComponent, canActivate: [authGuard],
//     children: [
//       { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard/dashboard.component') },
//       { path: 'agents',    canActivate: [roleGuard('TECNICO')], loadComponent: ... },
//       { path: 'users',     canActivate: [roleGuard('ADMIN')],   loadComponent: ... },
//       // ...
//     ]
//   },
//   { path: '**', redirectTo: 'dashboard' }
// ];
