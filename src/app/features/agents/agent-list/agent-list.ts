import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataTable, ColumnDef } from '../../../shared/components/data-table/data-table';
import { StatusBadge, StatusVariant } from '../../../shared/components/status-badge/status-badge';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorBanner }    from '../../../shared/components/error-banner/error-banner';
import { EmptyState }     from '../../../shared/components/empty-state/empty-state';
import { ConfirmDialog }  from '../../../shared/components/confirm-dialog/confirm-dialog';

import { AgentFilterBar }   from '../agent-filter-bar/agent-filter-bar';
import { AgentDetailModal } from '../agent-detail-modal/agent-detail-modal';

import { AgentService }          from '../../../core/services/agent';
import { AgentDTO, AgentFilter } from '../../../core/models/agent.model';
import { Page }                  from '../../../core/models/pagination.model';

@Component({
  selector:    'app-agent-list',
  standalone:  true,
  imports: [
    CommonModule,
    DataTable, ColumnDef, StatusBadge, LoadingSpinner, ErrorBanner, EmptyState,
    ConfirmDialog,
    AgentFilterBar, AgentDetailModal,
  ],
  templateUrl: './agent-list.html',
  styleUrl:    './agent-list.scss',
})
export class AgentList implements OnInit {
  private svc = inject(AgentService);

  agents:       AgentDTO[] = [];
  loading       = signal(false);
  error         = signal(false);

  page          = 0;
  pageSize      = 20;
  totalElements = 0;
  totalPages    = 0;

  activeFilter: AgentFilter = {};

  selectedAgentId = signal<string | null>(null);
  agentToDelete   = signal<AgentDTO | null>(null);
  agentToToggle   = signal<AgentDTO | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set(false);
    this.svc.getAll(this.activeFilter, this.page, this.pageSize).subscribe({
      next: (p: Page<AgentDTO>) => {
        this.agents        = p.content;
        this.totalElements = p.totalElements;
        this.totalPages    = p.totalPages;
        this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  onFilterChange(filter: AgentFilter) {
    this.activeFilter = filter;
    this.page = 0;
    this.load();
  }

  onPageChange(event: { page: number; pageSize: number }) {
    this.page     = event.page - 1;   // DataTable base-1 → API base-0
    this.pageSize = event.pageSize;
    this.load();
  }

  openDetail(agent: AgentDTO)  { this.selectedAgentId.set(agent.id); }
  closeDetail()                { this.selectedAgentId.set(null); }

  requestToggle(agent: AgentDTO, event: MouseEvent) {
    event.stopPropagation();
    this.agentToToggle.set(agent);
  }

  confirmToggle() {
    const agent = this.agentToToggle();
    if (!agent) return;
    const action$ = agent.enabled ? this.svc.disable(agent.id) : this.svc.enable(agent.id);
    action$.subscribe({
      next: (updated: AgentDTO) => {
        this.agents = this.agents.map(a => a.id === updated.id ? updated : a);
        if (this.selectedAgentId() === updated.id) {
          this.selectedAgentId.set(null);
          setTimeout(() => this.selectedAgentId.set(updated.id));
        }
        this.agentToToggle.set(null);
      },
      error: () => this.agentToToggle.set(null),
    });
  }

  cancelToggle() { this.agentToToggle.set(null); }

  requestDelete(agent: AgentDTO, event: MouseEvent) {
    event.stopPropagation();
    this.agentToDelete.set(agent);
  }

  confirmDelete() {
    const agent = this.agentToDelete();
    if (!agent) return;
    this.svc.delete(agent.id).subscribe({
      next: () => {
        this.agentToDelete.set(null);
        if (this.selectedAgentId() === agent.id) this.selectedAgentId.set(null);
        this.load();
      },
      error: () => this.agentToDelete.set(null),
    });
  }

  cancelDelete() { this.agentToDelete.set(null); }

  enabledStatus(enabled: boolean): StatusVariant {
    return enabled ? 'active' : 'inactive';
  }
}