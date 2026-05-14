import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { tokenInterceptor } from './core/auth/token-interceptor';
import { AuthService } from './core/auth/auth.service';

function initAuth(auth: AuthService) {
  return () => {
    const token = localStorage.getItem('complyx_access_token');
    if (!token) return Promise.resolve();

    return auth.fetchCurrentUser().toPromise().catch(() => {
      // Token inválido/expirado — clearSession ya se llama dentro del servicio
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [AuthService],
      multi: true,
    },
  ],
};