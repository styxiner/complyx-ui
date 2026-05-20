import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../api.config';
import {
  PolicySummaryDTO,
  PolicyDetailDTO,
  PolicyCreateDTO,
  PolicyUpdateDTO,
  PolicyFilter,
} from '../models/policy.model';
import { Page } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private http = inject(HttpClient);

  getAll(filter: PolicyFilter = {}, page = 0, size = 20, sort?: string): Observable<Page<PolicySummaryDTO>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (sort) params = params.set('sort', sort);
    if (filter.name) params = params.set('name', filter.name);
    if (filter.severity) params = params.set('severity', filter.severity);
    if (filter.assignedToAgentId) params = params.set('assignedToAgentId', filter.assignedToAgentId);
    if (filter.assignedToGroupId) params = params.set('assignedToGroupId', filter.assignedToGroupId);
    if (filter.regulationId)        params = params.set('regulationId', filter.regulationId);
    if (filter.includeUnassigned != null) params = params.set('includeUnassigned', String(filter.includeUnassigned));
    return this.http.get<Page<PolicySummaryDTO>>(API.policies.base, { params });
  }

  getById(id: string): Observable<PolicyDetailDTO> {
    return this.http.get<PolicyDetailDTO>(API.policies.byId(id));
  }

  getByAgent(agentId: string): Observable<PolicySummaryDTO[]> {
    return this.http.get<PolicySummaryDTO[]>(API.policies.byAgent(agentId));
  }

  create(dto: PolicyCreateDTO): Observable<PolicyDetailDTO> {
    return this.http.post<PolicyDetailDTO>(API.policies.base, dto);
  }

  update(id: string, dto: PolicyUpdateDTO): Observable<PolicyDetailDTO> {
    return this.http.put<PolicyDetailDTO>(API.policies.byId(id), dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(API.policies.byId(id));
  }

  assignToAgent(policyId: string, agentId: string): Observable<void> {
    return this.http.post<void>(API.policies.assignAgent(policyId, agentId), {});
  }

  unassignFromAgent(policyId: string, agentId: string): Observable<void> {
    return this.http.delete<void>(API.policies.unassignAgent(policyId, agentId));
  }

  assignToGroup(policyId: string, groupId: string): Observable<void> {
    return this.http.post<void>(API.policies.assignGroup(policyId, groupId), {});
  }

  unassignFromGroup(policyId: string, groupId: string): Observable<void> {
    return this.http.delete<void>(API.policies.unassignGroup(policyId, groupId));
  }
}