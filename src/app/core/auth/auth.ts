import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { API } from '../api.config';
import { LoginDTO, TokenResponseDTO, CurrentUser, JwtPayload, UserDTO } from '../models/user.model';

const ACCESS_TOKEN_KEY  = 'complyx_access_token';
const REFRESH_TOKEN_KEY = 'complyx_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _currentUser = signal<CurrentUser | null>(this.loadUserFromToken());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn  = computed(() => this._currentUser() !== null);

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login ────────────────────────────────────────────────────────────────

  login(credentials: LoginDTO): Observable<TokenResponseDTO> {
    return this.http.post<TokenResponseDTO>(API.auth.login, credentials).pipe(
      tap((response) => {
        this.saveTokens(response);
        const username = this.decodeUsername(response.accessToken);
        if (username) {
          this._currentUser.set({ id: '', username, email: '', roles: [] });
        }
      }),
    );
  }

  // ── Cargar usuario completo (roles, email, id) desde /api/users/me ───────

  fetchCurrentUser(): Observable<UserDTO> {
    return this.http.get<UserDTO>(API.users.me).pipe(
      tap((user) => {
        this._currentUser.set({
          id:       user.id,
          username: user.username,
          email:    user.email,
          roles:    user.roles,  // ya es string[] directamente
        });
      }),
    );
  }

  // ── Logout ───────────────────────────────────────────────────────────────

  logout(): void {
    this.http.post(API.auth.logout, {}).pipe(catchError(() => [])).subscribe();
    this.clearSession();
    this.router.navigate(['/login']);
  }

  // ── Refresh token ────────────────────────────────────────────────────────

  refreshAccessToken(): Observable<TokenResponseDTO> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token'));
    }
    return this.http.post<TokenResponseDTO>(API.auth.refresh, { refreshToken }).pipe(
      tap((response) => this.saveTokens(response)),
      catchError((err) => {
        this.clearSession();
        this.router.navigate(['/login']);
        return throwError(() => err);
      }),
    );
  }

  // ── Tokens ───────────────────────────────────────────────────────────────

  getAccessToken():  string | null { return localStorage.getItem(ACCESS_TOKEN_KEY);  }
  getRefreshToken(): string | null { return localStorage.getItem(REFRESH_TOKEN_KEY); }

  // ── Roles ─────────────────────────────────────────────────────────────────

  hasRole(...roles: string[]): boolean {
    return roles.some(r => this._currentUser()?.roles.includes(r) ?? false);
  }

  // ── Helpers privados ──────────────────────────────────────────────────────

  private saveTokens(response: TokenResponseDTO): void {
    localStorage.setItem(ACCESS_TOKEN_KEY,  response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
  }

  private clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this._currentUser.set(null);
  }

  private decodePayload(token: string): JwtPayload | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded  = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '=');
      return JSON.parse(atob(padded)) as JwtPayload;
    } catch { return null; }
  }

  private decodeUsername(token: string): string | null {
    return this.decodePayload(token)?.sub ?? null;
  }

  // Reconstruye el usuario desde localStorage al refrescar la página
  private loadUserFromToken(): CurrentUser | null {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;
    const payload = this.decodePayload(token);
    if (!payload || Date.now() / 1000 > payload.exp) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return null;
    }
    return { id: '', username: payload.sub, email: '', roles: [] };
  }
}