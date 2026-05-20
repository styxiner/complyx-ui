import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserDTO } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class User {
  private http = inject(HttpClient);
  // Base para todos los endpoints de UserController
  private readonly apiUrl = `${environment.apiUrl}/users`; 

  /** 
   * Obtiene el perfil del usuario actual
   */
  getProfile(): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/me`);
  }

  /**  
   * Listado de usuarios (Solo ADMIN)
   */
  getAllUsers(page = 0, size = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/${id}`);
  }

  /** 
   * Crear usuario (Solo ADMIN)
   */
  createUser(user: any): Observable<UserDTO> {
    return this.http.post<UserDTO>(this.apiUrl, user);
  }

  /** 
   * PUT /api/users/{userId}
   */
  updateUser(id: string, user: any): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/${id}`, user);
  }

  /** 
   * DELETE /api/users/{userId}
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** 
   * POST /api/users/{userId}/roles/{roleId}
   */
  assignRole(userId: string, roleId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/roles/${roleId}`, {});
  }

  /** 
   * DELETE /api/users/{userId}/roles/{roleId}
   */
  removeRole(userId: string, roleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/roles/${roleId}`);
  }
}