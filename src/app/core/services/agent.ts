import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../api.config';
import { AgentDTO, AgentFilter, AgentGroupDTO, AgentGroupFilter, AgentGroupCreateDTO, AgentGroupUpdateDTO } from '../models/agent.model';
import { Page } from '../models/pagination.model';

// ── Agentes ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AgentService {
  private http = inject(HttpClient);

  getAll(filter: AgentFilter = {}, page = 0, size = 20): Observable<Page<AgentDTO>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filter.hostname != null) params = params.set('hostname', filter.hostname);
    if (filter.ip       != null) params = params.set('ip',       filter.ip);
    if (filter.osName   != null) params = params.set('osName',   filter.osName);
    if (filter.enabled  != null) params = params.set('enabled',  String(filter.enabled));
    if (filter.groupId  != null) params = params.set('groupId',  filter.groupId);
    return this.http.get<Page<AgentDTO>>(API.agents.base, { params });
  }

  getById(id: string): Observable<AgentDTO> {
    return this.http.get<AgentDTO>(API.agents.byId(id));
  }

  enable(id: string): Observable<AgentDTO> {
    return this.http.patch<AgentDTO>(API.agents.enable(id), {});
  }

  disable(id: string): Observable<AgentDTO> {
    return this.http.patch<AgentDTO>(API.agents.disable(id), {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(API.agents.byId(id));
  }

  addToGroup(agentId: string, groupId: string): Observable<void> {
    return this.http.post<void>(API.agents.addToGroup(agentId, groupId), {});
  }

  removeFromGroup(agentId: string, groupId: string): Observable<void> {
    return this.http.delete<void>(API.agents.removeFromGroup(agentId, groupId));
  }

  getPolicies(agentId: string): Observable<any[]> {
    return this.http.get<any[]>(API.agents.policies(agentId));
  }
}

// ── Grupos de agentes ─────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AgentGroupService {
  private http = inject(HttpClient);

  getAll(filter: AgentGroupFilter = {}, page = 0, size = 20): Observable<Page<AgentGroupDTO>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filter.name        != null) params = params.set('name',        filter.name);
    if (filter.description != null) params = params.set('description', filter.description);
    if (filter.agentId     != null) params = params.set('agentId',     filter.agentId);
    return this.http.get<Page<AgentGroupDTO>>(API.groups.base, { params });
  }

  getById(id: string): Observable<AgentGroupDTO> {
    return this.http.get<AgentGroupDTO>(API.groups.byId(id));
  }

  create(dto: AgentGroupCreateDTO): Observable<AgentGroupDTO> {
    return this.http.post<AgentGroupDTO>(API.groups.base, dto);
  }

  update(id: string, dto: AgentGroupUpdateDTO): Observable<AgentGroupDTO> {
    return this.http.patch<AgentGroupDTO>(API.groups.byId(id), dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(API.groups.byId(id));
  }
}