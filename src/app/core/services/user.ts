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
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getProfile(): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/me`);
  }

  getAllUsers(page = 0, size = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/${id}`);
  }

  createUser(user: any): Observable<UserDTO> {
    return this.http.post<UserDTO>(this.apiUrl, user);
  }

  updateUser(id: string, user: any): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignRole(userId: string, roleId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/roles/${roleId}`, {});
  }

  removeRole(userId: string, roleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/roles/${roleId}`);
  }

  // Necesario para user-list: cargar roles disponibles
  getAllRoles(): Observable<any> {
    const params = new HttpParams().set('page', '0').set('size', '50');
    return this.http.get<any>(`${environment.apiUrl}/roles`, { params });
  }
}