import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../api.config';
import { UserDTO } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class user {
  private http = inject(HttpClient);

  getAllUsers(page: number = 0, size: number = 10, username?: string): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (username) {
      params = params.set('username', username);
    }
    return this.http.get<any>(API.users.base, { params });
  }

  createUser(dto: any): Observable<UserDTO> {
    return this.http.post<UserDTO>(API.users.base, dto);
  }

  updateUser(userId: string, dto: any): Observable<UserDTO> {
    return this.http.put<UserDTO>(API.users.byId(userId), dto);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(API.users.byId(userId));
  }

  getAllRoles(): Observable<any> {
    const params = new HttpParams().set('page', '0').set('size', '50');
    return this.http.get<any>('/api/roles', { params });
  }

  assignRole(userId: string, roleId: string): Observable<void> {
    return this.http.post<void>(API.users.assignRole(userId, roleId), {});
  }

  removeRole(userId: string, roleId: string): Observable<void> {
    return this.http.delete<void>(API.users.removeRole(userId, roleId));
  }
}