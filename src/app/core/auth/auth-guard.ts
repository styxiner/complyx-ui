import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el Signal de currentUser tiene datos (el token es válido), dejamos pasar
  if (authService.currentUser()) {
    return true;
  }

  // Si no, lo mandamos al login
  router.navigate(['/login']);
  return false;
};