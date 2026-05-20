import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PolicyComplianceDTO } from '../models/compliance.model';

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private http = inject(HttpClient);

  getCompliance(agentId: string, policyId: string): Observable<PolicyComplianceDTO> {
    return this.http.get<PolicyComplianceDTO>(
      `/api/agents/${agentId}/policies/${policyId}/results`
    );
  }
}