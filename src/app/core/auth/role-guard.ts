import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard = (...requiredRoles: string[]): CanActivateFn =>
  () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(...requiredRoles)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };