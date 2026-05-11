import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  //usamos inject para poder usar las funciones de login/logout
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      // Si el error es 401 (No autorizado) o 403 (Prohibido)
      if (error.status === 401 || error.status === 403) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};