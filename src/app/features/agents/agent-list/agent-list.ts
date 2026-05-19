import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { DataTable, ColumnDef } from '../../../shared/components/data-table/data-table';
import { StatusBadge, StatusVariant } from '../../../shared/components/status-badge/status-badge';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorBanner }    from '../../../shared/components/error-banner/error-banner';
import { EmptyState }     from '../../../shared/components/empty-state/empty-state';

import { AgentFilterBar } from '../agent-filter-bar/agent-filter-bar';

import { AgentService }          from '../../../core/services/agent';
import { AgentDTO, AgentFilter } from '../../../core/models/agent.model';
import { Page }                  from '../../../core/models/pagination.model';

@Component({
  selector:    'app-agent-list',
  standalone:  true,
  imports: [
    CommonModule,
    DataTable, ColumnDef, StatusBadge, LoadingSpinner, ErrorBanner, EmptyState,
    AgentFilterBar,
  ],
  templateUrl: './agent-list.html',
  styleUrl:    './agent-list.scss',
})
export class AgentList implements OnInit {
  private svc    = inject(AgentService);
  private router = inject(Router);

  agents:       AgentDTO[] = [];
  loading       = signal(false);
  error         = signal(false);

  page          = 0;
  pageSize      = 20;
  totalElements = 0;
  totalPages    = 0;

  activeFilter: AgentFilter = {};

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
    this.page     = event.page - 1;
    this.pageSize = event.pageSize;
    this.load();
  }

  openDetail(agent: AgentDTO) {
    this.router.navigate(['/agents', agent.id]);
  }

  enabledStatus(enabled: boolean): StatusVariant {
    return enabled ? 'active' : 'inactive';
  }
}