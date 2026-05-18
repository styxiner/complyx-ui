import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgentService } from '../../../core/services/agent.service';
import { AgentDTO } from '../../../core/models/agent.model';
import { DetailPanel } from '../../../shared/components/detail-panel/detail-panel';
import { StatusBadge, StatusVariant } from '../../../shared/components/status-badge/status-badge';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorBanner } from '../../../shared/components/error-banner/error-banner';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

type Tab = 'info' | 'policies' | 'risks';

interface PolicySummary {
  id: string;
  name: string;
  version: string;
  severity: string;
}

@Component({
  selector: 'app-agent-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DetailPanel,
    StatusBadge,
    LoadingSpinner,
    ErrorBanner,
    EmptyState,
  ],
  templateUrl: './agent-detail-modal.html',
  styleUrl: './agent-detail-modal.scss',
})
export class AgentDetailModal implements OnInit, OnChanges {
  @Input({ required: true }) agentId!: string;
  @Input({ required: true }) agentHostname!: string;

  @Output() closed        = new EventEmitter<void>();
  @Output() toggleRequest = new EventEmitter<AgentDTO>();
  @Output() deleteRequest = new EventEmitter<AgentDTO>();

  private svc = inject(AgentService);

  detail:   AgentDTO | null = null;
  policies: PolicySummary[] = [];
  loading  = true;
  error    = false;
  activeTab: Tab = 'info';

  ngOnInit()  { this.load(); }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['agentId'] && !changes['agentId'].firstChange) this.load();
  }

  load() {
    this.loading = true;
    this.error   = false;
    this.svc.getById(this.agentId).subscribe({
      next: (a: AgentDTO) => {
        this.detail  = a;
        this.loading = false;
        this.loadPolicies(a.id);
      },
      error: () => { this.error = true; this.loading = false; },
    });
  }

  private loadPolicies(agentId: string) {
    this.svc.getPolicies(agentId).subscribe({
      next: (list: PolicySummary[]) => this.policies = list,
      error: () => {},
    });
  }

  setTab(t: Tab) { this.activeTab = t; }

  enabledStatus(enabled: boolean): StatusVariant {
    return enabled ? 'active' : 'inactive';
  }

  severityStatus(s: string): StatusVariant {
    const m: Record<string, StatusVariant> = {
      CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low',
    };
    return m[s?.toUpperCase()] ?? 'unknown';
  }

  onToggle() { if (this.detail) this.toggleRequest.emit(this.detail); }
  onDelete() { if (this.detail) this.deleteRequest.emit(this.detail); }
}