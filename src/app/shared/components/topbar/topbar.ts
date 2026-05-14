import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith, distinctUntilChanged } from 'rxjs';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/agents':      'Agentes',
  '/policies':    'Políticas',
  '/regulations': 'Normativas',
  '/risks':       'Riesgos',
  '/events':      'Eventos',
  '/reports':     'Reportes',
  '/users':       'Usuarios',
  '/profile':     'Mi perfil',
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  auth   = inject(AuthService);
  router = inject(Router);

  pageTitle = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => PAGE_TITLES[(e as NavigationEnd).urlAfterRedirects.split('?')[0]] ?? ''),
      startWith(PAGE_TITLES[this.router.url.split('?')[0]] ?? ''),
      distinctUntilChanged(),
    ),
    { initialValue: PAGE_TITLES[this.router.url.split('?')[0]] ?? '' },
  );
}