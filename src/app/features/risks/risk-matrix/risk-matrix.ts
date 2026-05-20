import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RiskService } from '../../../core/services/risk';
import { RiskDTO, RiskFilter, RiskLevel, RiskStatus, RISK_LEVEL_META, RISK_STATUS_META } from '../../../core/models/risk.model';
import { Page } from '../../../core/models/pagination.model';
import { StatusBadge, StatusVariant } from '../../../shared/components/status-badge/status-badge';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorBanner } from '../../../shared/components/error-banner/error-banner';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { RiskFilterBar } from '../risk-filter-bar/risk-filter-bar';
import { RiskDetailModal } from '../risk-detail-modal/risk-detail-modal';
import { RiskCreateModal } from '../risk-create-modal/risk-create-modal';

@Component({
  selector: 'app-risk-matrix',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    StatusBadge, LoadingSpinner, ErrorBanner, EmptyState,
    RiskFilterBar, RiskDetailModal, RiskCreateModal,
  ],
  templateUrl: './risk-matrix.html',
  styleUrl: './risk-matrix.scss',
})
export class RiskMatrix implements OnInit {
  private svc   = inject(RiskService);
  private route = inject(ActivatedRoute);

  risks         = signal<RiskDTO[]>([]);
  loading       = signal(false);
  error         = signal(false);
  totalElements = signal(0);
  totalPages    = signal(0);
  page          = 0;
  pageSize      = 20;
  activeFilter: RiskFilter = {};

  selectedRiskId  = signal<string | null>(null);
  showCreateModal = signal(false);

  // KPIs: se cargan aparte con size=1000 para tener el total real
  kpis = signal<Record<RiskLevel, number>>({ LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 });

  readonly levelMeta  = RISK_LEVEL_META;
  readonly statusMeta = RISK_STATUS_META;
  readonly levels: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  ngOnInit() {
    const agentId = this.route.snapshot.queryParamMap.get('agentId');
    if (agentId) this.activeFilter = { agentId };
    this.load();
    this.loadKpis();
  }

  load() {
    this.loading.set(true); this.error.set(false);
    this.svc.getAll(this.activeFilter, this.page, this.pageSize).subscribe({
      next: (p: Page<RiskDTO>) => {
        this.risks.set(p.content);
        this.totalElements.set(p.totalElements);
        this.totalPages.set(p.totalPages);
        this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  // Carga todos los riesgos (sin paginar) solo para calcular KPIs por nivel
  private loadKpis() {
    const levels: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const counts: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    let pending = levels.length;

    levels.forEach(level => {
      this.svc.getAll({ ...this.activeFilter, riskLevel: level }, 0, 1).subscribe({
        next: (p) => {
          counts[level] = p.totalElements;
          if (--pending === 0) this.kpis.set({ ...counts });
        },
        error: () => { if (--pending === 0) this.kpis.set({ ...counts }); },
      });
    });
  }

  onFilterChange(f: RiskFilter) {
    this.activeFilter = f;
    this.page = 0;
    this.load();
    this.loadKpis();
  }

  onPageChange(step: number) {
    const next = this.page + step;
    if (next >= 0 && next < this.totalPages()) { this.page = next; this.load(); }
  }

  openDetail(id: string)  { this.selectedRiskId.set(id); }
  closeDetail()           { this.selectedRiskId.set(null); }
  onStateChanged()        { this.load(); this.loadKpis(); }

  openCreate()  { this.showCreateModal.set(true); }
  closeCreate() { this.showCreateModal.set(false); }
  onCreated()   { this.showCreateModal.set(false); this.load(); this.loadKpis(); }

  levelVariant(l: RiskLevel): StatusVariant {
    return ({ CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' } as any)[l] ?? 'unknown';
  }

  statusVariant(s: RiskStatus): StatusVariant {
    return ({
      OPEN: 'active', MONITORING: 'active',
      ACCEPTED: 'medium', TRANSFERRED: 'medium',
      MITIGATED: 'low', CLOSED: 'inactive',
    } as any)[s] ?? 'unknown';
  }
}