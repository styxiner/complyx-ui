import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models/pagination.model';
import {
  RiskDTO, RiskDetailDTO, RiskCreateDTO, RiskUpdateDTO, RiskFilter,
} from '../models/risk.model';

const BASE = '/api/risks';

@Injectable({ providedIn: 'root' })
export class RiskService {
  private http = inject(HttpClient);

  // ── Consultas ─────────────────────────────────────────────────────────────

  getAll(filter: RiskFilter = {}, page = 0, size = 20, sort = 'createdDate,desc'): Observable<Page<RiskDTO>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (filter.agentId)   params = params.set('agentId',   filter.agentId);
    if (filter.status)    params = params.set('status',    filter.status);
    if (filter.riskLevel) params = params.set('riskLevel', filter.riskLevel);
    if (filter.threatId)  params = params.set('threatId',  filter.threatId);
    return this.http.get<Page<RiskDTO>>(BASE, { params });
  }

  getById(id: string): Observable<RiskDetailDTO> {
    return this.http.get<RiskDetailDTO>(`${BASE}/${id}`);
  }

  // ── Escritura ─────────────────────────────────────────────────────────────

  create(dto: RiskCreateDTO): Observable<RiskDTO> {
    return this.http.post<RiskDTO>(BASE, dto);
  }

  update(id: string, dto: RiskUpdateDTO): Observable<RiskDTO> {
    return this.http.patch<RiskDTO>(`${BASE}/${id}`, dto);
  }

  // ── Transiciones de estado ────────────────────────────────────────────────

  accept(id: string):   Observable<RiskDTO> { return this.http.post<RiskDTO>(`${BASE}/${id}/accept`,   {}); }
  transfer(id: string): Observable<RiskDTO> { return this.http.post<RiskDTO>(`${BASE}/${id}/transfer`, {}); }
  monitor(id: string):  Observable<RiskDTO> { return this.http.post<RiskDTO>(`${BASE}/${id}/monitor`,  {}); }
  close(id: string):    Observable<RiskDTO> { return this.http.post<RiskDTO>(`${BASE}/${id}/close`,    {}); }

  // ── Políticas mitigadoras ─────────────────────────────────────────────────

  linkPolicy(riskId: string, policyId: string):   Observable<void> {
    return this.http.put<void>(`${BASE}/${riskId}/policies/${policyId}`, {});
  }

  unlinkPolicy(riskId: string, policyId: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/${riskId}/policies/${policyId}`);
  }
}