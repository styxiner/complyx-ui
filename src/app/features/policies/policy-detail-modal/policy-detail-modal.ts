import { Component, Input, Output, EventEmitter, OnInit, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyDetailDTO } from '../../../core/models/policy.model';
import { PolicyService } from '../../../core/services/policy';
import { DetailPanel } from '../../../shared/components/detail-panel/detail-panel';
import { StatusBadge, StatusVariant } from '../../../shared/components/status-badge/status-badge';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorBanner } from '../../../shared/components/error-banner/error-banner';
import { HasRole } from '../../../shared/directives/has-role';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago-pipe';
import { SeverityLabelPipe } from '../../../shared/pipes/severity-label-pipe';

type Tab = 'info' | 'elements';

@Component({
  selector: 'app-policy-detail-modal',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    DetailPanel,
    StatusBadge,
    LoadingSpinner,
    ErrorBanner,
    HasRole,
    TimeAgoPipe,
    SeverityLabelPipe,
  ],
  templateUrl: './policy-detail-modal.html',
  styleUrl: './policy-detail-modal.scss',
})
export class PolicyDetailModal implements OnInit {
  /** Se pasa el summary al abrir; el detalle completo se carga aquí */
  @Input({ required: true }) policyId!: string;
  @Input({ required: true }) policyName!: string;

  @Output() closed          = new EventEmitter<void>();
  @Output() requestEdit     = new EventEmitter<PolicyDetailDTO>();
  @Output() requestDelete   = new EventEmitter<PolicyDetailDTO>();

  private svc = inject(PolicyService);

  detail: PolicyDetailDTO | null = null;
  loading = true;
  error   = false;
  activeTab: Tab = 'info';
  expandedElements = signal<Set<string>>(new Set());

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error   = false;
    this.svc.getById(this.policyId).subscribe({
      next: d => { this.detail = d; this.loading = false; },
      error: () => { this.error = true; this.loading = false; },
    });
  }

  setTab(t: Tab) { this.activeTab = t; }

  toggleElement(id: string) {
    this.expandedElements.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isExpanded(id: string) { return this.expandedElements().has(id); }

  severityStatus(s: string): StatusVariant {
    const m: Record<string, StatusVariant> = {
      CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low',
    };
    return m[s] ?? 'unknown';
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { DRAFT: 'Borrador', ACTIVE: 'Activa', INACTIVE: 'Inactiva', ARCHIVED: 'Archivada' };
    return m[s] ?? s;
  }

  totalChecks(): number {
    return this.detail?.elements.reduce((sum, el) => sum + el.checks.length, 0) ?? 0;
  }
}