import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, throwError } from 'rxjs';
import { API } from '../api.config';
import { UserDTO } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // Router NO se inyecta en el constructor — evita la dependencia circular
  // Se obtiene lazy con inject() solo cuando hace falta (logout, etc.)

  currentUser = signal<any>(null);

  constructor() {
    // const token = localStorage.getItem('complyx_access_token');
    // if (token) {
    //   // Solo marcamos que hay sesión — sin peticiones HTTP aquí
    //   this.currentUser.set({ id: '', username: '', email: '', roles: [] });
    // }
    // lo hace ahora el APP_INITIALIZER
  }

  login(credentials: { username: string; password: string }): Observable<void> {
    return this.http.post<any>(API.auth.login, credentials).pipe(
      tap((res) => {
        localStorage.setItem('complyx_access_token',  res.accessToken);
        localStorage.setItem('complyx_refresh_token', res.refreshToken);
      }),
      map(() => void 0),
    );
  }

  fetchCurrentUser(): Observable<UserDTO> {
    return this.http.get<UserDTO>(API.users.me).pipe(
      tap((user) => {
        this.currentUser.set({
          id:       user.id,
          username: user.username,
          email:    user.email,
          roles:    user.roles,
        });
      }),
      catchError((err) => {
        this.clearSession();
        return throwError(() => err);
      }),
    );
  }

  logout(): void {
    this.clearSession();
    window.location.href = '/login';
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(...roles: string[]): boolean {
    const user = this.currentUser();
    return roles.some(r => user?.roles?.includes(r) ?? false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('complyx_access_token');
  }

  private clearSession(): void {
    localStorage.removeItem('complyx_access_token');
    localStorage.removeItem('complyx_refresh_token');
    this.currentUser.set(null);
  }
}