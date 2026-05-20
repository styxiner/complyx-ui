import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models/pagination.model';
import { ThreatDTO, ThreatCreateDTO, ThreatUpdateDTO } from '../models/threat.model';

const BASE = '/api/threats';

@Injectable({ providedIn: 'root' })
export class ThreatService {
  private http = inject(HttpClient);

  getAll(page = 0, size = 20, sort = 'name,asc'): Observable<Page<ThreatDTO>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    return this.http.get<Page<ThreatDTO>>(BASE, { params });
  }

  getById(id: string): Observable<ThreatDTO> {
    return this.http.get<ThreatDTO>(`${BASE}/${id}`);
  }

  create(dto: ThreatCreateDTO): Observable<ThreatDTO> {
    return this.http.post<ThreatDTO>(BASE, dto);
  }

  update(id: string, dto: ThreatUpdateDTO): Observable<ThreatDTO> {
    return this.http.patch<ThreatDTO>(`${BASE}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }
}