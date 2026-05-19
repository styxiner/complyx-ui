import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RiskService } from '../../../core/services/risk';
import { PolicyService } from '../../../core/services/policy';
import {
  RiskDetailDTO, RiskStatus, RiskUpdateDTO,
  RISK_STATUS_META, RISK_LEVEL_META, RISK_TRANSITIONS, PolicySummaryRef,
} from '../../../core/models/risk.model';
import { PolicySummaryDTO } from '../../../core/models/policy.model';
import { StatusBadge, StatusVariant } from '../../../shared/components/status-badge/status-badge';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorBanner } from '../../../shared/components/error-banner/error-banner';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

type Tab = 'info' | 'policies';

@Component({
  selector: 'app-risk-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadge, LoadingSpinner, ErrorBanner, ConfirmDialog],
  templateUrl: './risk-detail-modal.html',
  styleUrl: './risk-detail-modal.scss',
})
export class RiskDetailModal implements OnInit, OnChanges {
  @Input({ required: true }) riskId!: string;
  @Output() closed         = new EventEmitter<void>();
  @Output() stateChanged   = new EventEmitter<void>();

  private riskSvc   = inject(RiskService);
  private policySvc = inject(PolicyService);

  detail      = signal<RiskDetailDTO | null>(null);
  loading     = signal(false);
  error       = signal(false);
  activeTab   = signal<Tab>('info');

  // Edición inline de impact/probability
  editing     = signal(false);
  editImpact      = 0;
  editProbability = 0;
  saving      = signal(false);

  // Transición de estado
  pendingTransition = signal<RiskStatus | null>(null);
  showTransitionConfirm = signal(false);

  // Políticas disponibles para vincular
  availablePolicies = signal<PolicySummaryDTO[]>([]);
  policiesLoading   = signal(false);
  showPolicyPicker  = signal(false);
  linkingPolicy     = signal(false);
  policyToUnlink    = signal<PolicySummaryRef | null>(null);
  showUnlinkConfirm = signal(false);

  readonly statusMeta = RISK_STATUS_META;
  readonly levelMeta  = RISK_LEVEL_META;

  ngOnInit()  { this.load(); }
  ngOnChanges(c: SimpleChanges) { if (c['riskId'] && !c['riskId'].firstChange) this.load(); }

  load() {
    this.loading.set(true); this.error.set(false);
    this.riskSvc.getById(this.riskId).subscribe({
      next: (d) => { this.detail.set(d); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  setTab(t: Tab) { this.activeTab.set(t); }

  // ── Edición inline ────────────────────────────────────────────────────────

  startEdit() {
    const d = this.detail();
    if (!d) return;
    this.editImpact      = d.impact;
    this.editProbability = d.probability;
    this.editing.set(true);
  }

  cancelEdit() { this.editing.set(false); }

  saveEdit() {
    const d = this.detail(); if (!d) return;
    this.saving.set(true);
    const dto: RiskUpdateDTO = { impact: this.editImpact, probability: this.editProbability };
    this.riskSvc.update(d.id, dto).subscribe({
      next: () => { this.saving.set(false); this.editing.set(false); this.load(); this.stateChanged.emit(); },
      error: () => this.saving.set(false),
    });
  }

  // ── Transiciones ──────────────────────────────────────────────────────────

  availableTransitions(): RiskStatus[] {
    const d = this.detail(); if (!d) return [];
    return RISK_TRANSITIONS[d.riskStatus] ?? [];
  }

  requestTransition(s: RiskStatus) { this.pendingTransition.set(s); this.showTransitionConfirm.set(true); }
  cancelTransition()               { this.showTransitionConfirm.set(false); }

  confirmTransition() {
    const d = this.detail(); const s = this.pendingTransition();
    if (!d || !s) return;
    const action$ = ({
      ACCEPTED:    () => this.riskSvc.accept(d.id),
      TRANSFERRED: () => this.riskSvc.transfer(d.id),
      MONITORING:  () => this.riskSvc.monitor(d.id),
      CLOSED:      () => this.riskSvc.close(d.id),
      MITIGATED:   () => this.riskSvc.close(d.id), // no endpoint propio; se cierra
      OPEN:        () => this.riskSvc.accept(d.id),
    } as any)[s];
    action$().subscribe({
      next: () => { this.showTransitionConfirm.set(false); this.load(); this.stateChanged.emit(); },
      error: () => this.showTransitionConfirm.set(false),
    });
  }

  // ── Políticas mitigadoras ─────────────────────────────────────────────────

  openPolicyPicker() {
    this.policiesLoading.set(true);
    this.showPolicyPicker.set(true);
    const linkedIds = this.detail()?.policySummaryDto.map(p => p.id) ?? [];
    this.policySvc.getAll({}, 0, 200).subscribe({
      next: (page) => {
        this.availablePolicies.set(page.content.filter(p => !linkedIds.includes(p.id)));
        this.policiesLoading.set(false);
      },
      error: () => this.policiesLoading.set(false),
    });
  }

  closePolicyPicker() { this.showPolicyPicker.set(false); }

  linkPolicy(policy: PolicySummaryDTO) {
    const d = this.detail(); if (!d) return;
    this.linkingPolicy.set(true);
    this.closePolicyPicker();
    this.riskSvc.linkPolicy(d.id, policy.id).subscribe({
      next: () => { this.linkingPolicy.set(false); this.load(); },
      error: () => this.linkingPolicy.set(false),
    });
  }

  requestUnlink(p: PolicySummaryRef) { this.policyToUnlink.set(p); this.showUnlinkConfirm.set(true); }
  cancelUnlink()                     { this.showUnlinkConfirm.set(false); }

  confirmUnlink() {
    const d = this.detail(); const p = this.policyToUnlink();
    if (!d || !p) return;
    this.riskSvc.unlinkPolicy(d.id, p.id).subscribe({
      next: () => { this.showUnlinkConfirm.set(false); this.policyToUnlink.set(null); this.load(); },
      error: () => this.showUnlinkConfirm.set(false),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  transitionLabel(s: RiskStatus): string { return RISK_STATUS_META[s]?.label ?? s; }

  levelVariant(l: string): StatusVariant {
    return ({ CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' } as any)[l] ?? 'unknown';
  }

  statusVariant(s: string): StatusVariant {
    return ({
      OPEN: 'active', MONITORING: 'active',
      ACCEPTED: 'medium', TRANSFERRED: 'medium',
      MITIGATED: 'low', CLOSED: 'inactive',
    } as any)[s] ?? 'unknown';
  }

  severityVariant(s: string): StatusVariant {
    return ({ CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' } as any)[s] ?? 'unknown';
  }

  riskScore(impact: number, probability: number): number {
    return Math.round(impact * probability * 100) / 100;
  }
}