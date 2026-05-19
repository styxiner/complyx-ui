import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { AgentService }      from '../../../core/services/agent';
import { PolicyService }     from '../../../core/services/policy';
import { AgentDTO }          from '../../../core/models/agent.model';
import { PolicySummaryDTO }  from '../../../core/models/policy.model';
import { StatusBadge, StatusVariant } from '../../../shared/components/status-badge/status-badge';
import { LoadingSpinner }    from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorBanner }       from '../../../shared/components/error-banner/error-banner';
import { EmptyState }        from '../../../shared/components/empty-state/empty-state';
import { ConfirmDialog }     from '../../../shared/components/confirm-dialog/confirm-dialog';
import { PolicyPickerModal } from '../../policies/policy-picker-modal/policy-picker-modal';

type Tab = 'info' | 'policies' | 'risks';

@Component({
  selector: 'app-agent-detail-modal',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    StatusBadge, LoadingSpinner, ErrorBanner, EmptyState, ConfirmDialog,
    PolicyPickerModal,
  ],
  templateUrl: './agent-detail-modal.html',
  styleUrl:    './agent-detail-modal.scss',
})
export class AgentDetailModal implements OnInit {
  private agentSvc  = inject(AgentService);
  private policySvc = inject(PolicyService);
  private router    = inject(Router);
  private route     = inject(ActivatedRoute);

  agent           = signal<AgentDTO | null>(null);
  policies        = signal<PolicySummaryDTO[]>([]);
  loading         = signal(false);
  error           = signal(false);
  policiesLoading = signal(false);
  activeTab       = signal<Tab>('info');

  showToggleConfirm = signal(false);
  showDeleteConfirm = signal(false);
  showPicker        = signal(false);
  assigning         = signal(false);
  policyToUnassign     = signal<PolicySummaryDTO | null>(null);
  showUnassignConfirm  = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  private load(id: string) {
    this.loading.set(true);
    this.error.set(false);
    this.agentSvc.getById(id).subscribe({
      next: (a) => { this.agent.set(a); this.loading.set(false); this.loadPolicies(a.id); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  loadPolicies(agentId: string) {
    this.policiesLoading.set(true);
    // Usa GET /api/policies/agent/{agentId} — el endpoint que sí existe en el backend
    this.policySvc.getByAgent(agentId).subscribe({
      next: (list) => { this.policies.set(list); this.policiesLoading.set(false); },
      error: () => this.policiesLoading.set(false),
    });
  }

  setTab(t: Tab) { this.activeTab.set(t); }
  goBack()       { this.router.navigate(['/agents']); }

  requestToggle() { this.showToggleConfirm.set(true); }
  cancelToggle()  { this.showToggleConfirm.set(false); }
  confirmToggle() {
    const a = this.agent(); if (!a) return;
    const req$ = a.enabled ? this.agentSvc.disable(a.id) : this.agentSvc.enable(a.id);
    req$.subscribe({
      next: (u) => { this.agent.set(u); this.showToggleConfirm.set(false); },
      error: () => this.showToggleConfirm.set(false),
    });
  }

  requestDelete() { this.showDeleteConfirm.set(true); }
  cancelDelete()  { this.showDeleteConfirm.set(false); }
  confirmDelete() {
    const a = this.agent(); if (!a) return;
    this.agentSvc.delete(a.id).subscribe({
      next: () => this.router.navigate(['/agents']),
      error: () => this.showDeleteConfirm.set(false),
    });
  }

  openPicker()  { this.showPicker.set(true); }
  closePicker() { this.showPicker.set(false); }

  onPolicySelected(policy: PolicySummaryDTO) {
    const a = this.agent(); if (!a) return;
    this.assigning.set(true);
    this.closePicker();
    this.policySvc.assignToAgent(policy.id, a.id).subscribe({
      next: () => { this.assigning.set(false); this.loadPolicies(a.id); },
      error: () => this.assigning.set(false),
    });
  }

  requestUnassign(p: PolicySummaryDTO) { this.policyToUnassign.set(p); this.showUnassignConfirm.set(true); }
  cancelUnassign()                     { this.showUnassignConfirm.set(false); }
  confirmUnassign() {
    const a = this.agent(); const p = this.policyToUnassign();
    if (!a || !p) return;
    this.policySvc.unassignFromAgent(p.id, a.id).subscribe({
      next: () => { this.showUnassignConfirm.set(false); this.policyToUnassign.set(null); this.loadPolicies(a.id); },
      error: () => this.showUnassignConfirm.set(false),
    });
  }

  assignedPolicyIds(): string[] { return this.policies().map(p => p.id); }

  enabledStatus(enabled: boolean): StatusVariant { return enabled ? 'active' : 'inactive'; }

  severityStatus(s: string): StatusVariant {
    return ({ CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' } as any)[s?.toUpperCase()] ?? 'unknown';
  }

  severityClass(s: string): string {
    return ({ CRITICAL: 'sev--critical', HIGH: 'sev--high', MEDIUM: 'sev--medium', LOW: 'sev--low' } as any)[s] ?? '';
  }

  severityLabel(s: string): string {
    return ({ CRITICAL: 'Crítica', HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' } as any)[s] ?? s;
  }
}