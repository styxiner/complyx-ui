import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API } from '../api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Guardamos el usuario actual en un Signal para que la UI reaccione a los cambios
 currentUser = signal<any>(null);

constructor() {
  this.currentUser.set(this.decodeToken());
}
  login(credentials: any): Observable<void> {
    return this.http.post<any>(`${environment.apiUrl}${API.auth.login}`, credentials)
      .pipe(
        tap(res => {
          localStorage.setItem('complyx_access_token', res.accessToken);
          localStorage.setItem('complyx_refresh_token', res.refreshToken);
          this.currentUser.set(this.decodeToken());
        }),
        map(() => void 0)
      );
  }

  logout(): void {
    localStorage.removeItem('complyx_access_token');
    localStorage.removeItem('complyx_refresh_token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    // Suponiendo que el JWT tiene un campo 'roles' o 'role'
    return user?.roles?.includes(role) || user?.role === role || false;
  }

  private decodeToken(): any {
    const token = localStorage.getItem('complyx_access_token');
    if (!token) return null;

    try {
      // Un JWT tiene 3 partes. La segunda (índice 1) es la que tiene los datos (payload).
      const payload = token.split('.')[1];
      const decodedJson = atob(payload);
      return JSON.parse(decodedJson);
    } catch (e) {
      return null;
    }
  }
}