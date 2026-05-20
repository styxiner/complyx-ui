import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { regulation } from '../../../core/services/regulation';
import { PolicyService } from '../../../core/services/policy';
import { RegulationDetailDTO, RegSectionDTO } from '../../../core/models/regulation.model';
import { PolicySummaryDTO, PolicyDetailDTO, PolicyUpdateDTO, PolicyStatus } from '../../../core/models/policy.model';
import { PolicyBuilder } from '../policy-builder/policy-builder';

@Component({
  selector: 'app-regulation-detail-modal',
  standalone: true,
  imports: [CommonModule, PolicyBuilder],
  templateUrl: './regulation-detail-modal.html',
  styleUrl: './regulation-detail-modal.scss'
})
export class RegulationDetailModal implements OnChanges {
  private regulationSvc = inject(regulation);
  private policySvc     = inject(PolicyService);

  @Input() isOpen = false;
  @Input() regulationId: string | null = null;
  @Output() closed = new EventEmitter<void>();

  regulation        = signal<RegulationDetailDTO | null>(null);
  loading           = signal<boolean>(false);
  error             = signal<string>('');
  showPolicyBuilder = signal<boolean>(false);

  // Políticas vinculadas (solo las que tienen checks referenciando secciones de esta normativa)
  linkedPolicies  = signal<PolicySummaryDTO[]>([]);
  policiesLoading = signal<boolean>(false);

  // ── Desplegable para vincular políticas existentes ──────────────────────────
  showLinkPanel       = signal<boolean>(false);
  allPolicies         = signal<PolicySummaryDTO[]>([]);
  allPoliciesLoading  = signal<boolean>(false);
  // Índice de la política expandida en el panel de vinculación (-1 = ninguna)
  expandedPolicyIndex = signal<number>(-1);
  // Secciones seleccionadas por política: Map<policyId, Set<sectionId>>
  selectedSections    = signal<Map<string, Set<string>>>(new Map());
  linkingPolicyId     = signal<string | null>(null);
  linkError           = signal<string>('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['regulationId'] && this.regulationId) {
      this.loadDetail(this.regulationId);
      this.loadLinkedPolicies(this.regulationId);
    } else if (changes['isOpen'] && !this.isOpen) {
      this.regulation.set(null);
      this.linkedPolicies.set([]);
      this.showPolicyBuilder.set(false);
      this.showLinkPanel.set(false);
      this.expandedPolicyIndex.set(-1);
      this.selectedSections.set(new Map());
      this.linkError.set('');
    }
  }

  private loadDetail(id: string): void {
    this.loading.set(true);
    this.regulationSvc.getById(id).subscribe({
      next:  (d) => { this.regulation.set(d); this.loading.set(false); },
      error: ()  => { this.error.set('No se ha podido cargar el detalle.'); this.loading.set(false); }
    });
  }

  private loadLinkedPolicies(regulationId: string): void {
    this.policiesLoading.set(true);
    this.policySvc.getAll({ regulationId }, 0, 50).subscribe({
      next:  (p) => { this.linkedPolicies.set(p.content ?? []); this.policiesLoading.set(false); },
      error: ()  => { this.policiesLoading.set(false); }
    });
  }

  // ── Abrir/cerrar panel de vinculación ───────────────────────────────────────
  toggleLinkPanel(): void {
    if (this.showLinkPanel()) {
      this.showLinkPanel.set(false);
      return;
    }
    this.showLinkPanel.set(true);
    this.loadAllPolicies();
  }

  private loadAllPolicies(): void {
    this.allPoliciesLoading.set(true);
    this.policySvc.getAll({}, 0, 100).subscribe({
      next:  (p) => { this.allPolicies.set(p.content ?? []); this.allPoliciesLoading.set(false); },
      error: ()  => { this.allPoliciesLoading.set(false); }
    });
  }

  toggleExpandPolicy(index: number): void {
    this.expandedPolicyIndex.set(this.expandedPolicyIndex() === index ? -1 : index);
  }

  toggleSection(policyId: string, sectionId: string): void {
    const map = new Map(this.selectedSections());
    const set = new Set(map.get(policyId) ?? []);
    set.has(sectionId) ? set.delete(sectionId) : set.add(sectionId);
    map.set(policyId, set);
    this.selectedSections.set(map);
  }

  isSectionSelected(policyId: string, sectionId: string): boolean {
    return this.selectedSections().get(policyId)?.has(sectionId) ?? false;
  }

  selectedCount(policyId: string): number {
    return this.selectedSections().get(policyId)?.size ?? 0;
  }

  // ── Vincular secciones seleccionadas a una política ─────────────────────────
  linkSections(policy: PolicySummaryDTO): void {
    const sectionIds = Array.from(this.selectedSections().get(policy.id) ?? []);
    if (sectionIds.length === 0) {
      this.linkError.set('Selecciona al menos una sección.');
      return;
    }
    this.linkError.set('');
    this.linkingPolicyId.set(policy.id);

    this.policySvc.getById(policy.id).subscribe({
      next: (detail: PolicyDetailDTO) => {
        const updatePayload: PolicyUpdateDTO = {
          name:        detail.name,
          description: detail.description,
          version:     detail.version,
          severity:    detail.severity,
          status:      detail.status as PolicyStatus,
          elements: (detail.elements ?? []).map((el: any) => ({
            id:   el.id,
            name: el.name,
            checks: (el.checks ?? []).map((ch: any) => ({
              id:                   ch.id,
              name:                 ch.name,
              checkParams:          ch.checkParams,
              regulationSectionIds: Array.from(
                new Set([...(ch.regulationSectionIds ?? []), ...sectionIds])
              ),
              remediations: ch.remediations ?? []
            }))
          }))
        };

        this.policySvc.update(policy.id, updatePayload).subscribe({
          next: () => {
            this.linkingPolicyId.set(null);
            // Limpiar selección de esta política
            const map = new Map(this.selectedSections());
            map.delete(policy.id);
            this.selectedSections.set(map);
            this.expandedPolicyIndex.set(-1);
            // Recargar políticas vinculadas
            if (this.regulationId) this.loadLinkedPolicies(this.regulationId);
          },
          error: (err) => {
            this.linkingPolicyId.set(null);
            this.linkError.set(err?.error?.message ?? 'Error al vincular la política.');
          }
        });
      },
      error: () => {
        this.linkingPolicyId.set(null);
        this.linkError.set('No se pudo obtener el detalle de la política.');
      }
    });
  }

  onPolicySaved(): void {
    this.showPolicyBuilder.set(false);
    if (this.regulationId) this.loadLinkedPolicies(this.regulationId);
  }

  close(): void { this.closed.emit(); }

  viewPdf(regulationId: string): void {
    this.regulationSvc.getPdf(regulationId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    });
  }
}