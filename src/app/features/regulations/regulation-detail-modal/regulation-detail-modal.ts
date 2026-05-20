import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { regulation } from '../../../core/services/regulation';
import { PolicyService } from '../../../core/services/policy';
import { RegulationDetailDTO } from '../../../core/models/regulation.model';
import { PolicySummaryDTO } from '../../../core/models/policy.model';
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

  regulation       = signal<RegulationDetailDTO | null>(null);
  loading          = signal<boolean>(false);
  error            = signal<string>('');
  showPolicyBuilder = signal<boolean>(false);

  // Políticas asociadas (Opción B: todas las políticas, sin filtro de sección)
  linkedPolicies       = signal<PolicySummaryDTO[]>([]);
  policiesLoading      = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['regulationId'] && this.regulationId) {
      this.loadDetail(this.regulationId);
      this.loadPolicies(this.regulationId);
    } else if (changes['isOpen'] && !this.isOpen) {
      this.regulation.set(null);
      this.linkedPolicies.set([]);
      this.showPolicyBuilder.set(false);
    }
  }

  private loadDetail(id: string): void {
    this.loading.set(true);
    this.regulationSvc.getById(id).subscribe({
      next:  (d) => { this.regulation.set(d); this.loading.set(false); },
      error: ()  => { this.error.set('No se ha podido cargar el detalle.'); this.loading.set(false); }
    });
  }

  // Opción B: carga todas las políticas sin filtro de sección
  // El totalElements nos da el contador real; aquí cargamos hasta 50 para mostrar nombres
  private loadPolicies(regulationId: string): void {
    this.policiesLoading.set(true);
    this.policySvc.getAll({}, 0, 50).subscribe({
      next:  (p) => { this.linkedPolicies.set(p.content ?? []); this.policiesLoading.set(false); },
      error: ()  => { this.policiesLoading.set(false); }
    });
  }

  onPolicySaved(): void {
    // Al guardar una nueva política recargamos la lista
    this.showPolicyBuilder.set(false);
    if (this.regulationId) this.loadPolicies(this.regulationId);
  }

  close(): void { this.closed.emit(); }
}