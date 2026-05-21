import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyService } from '../../../core/services/policy';
import { PolicySummaryDTO, PolicyFilter, PolicyDetailDTO } from '../../../core/models/policy.model';
import { PolicyDetailModal } from '../policy-detail-modal/policy-detail-modal';
import { PolicyFilterBar } from '../policy-filter-bar/policy-filter-bar';
import { PolicyForm } from '../policy-form/policy-form';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule, PolicyDetailModal, PolicyFilterBar, PolicyForm],
  templateUrl: './policy-list.html',
  styleUrl: './policy-list.scss',
})
export class PolicyList implements OnInit {
  private policySvc = inject(PolicyService);

  policies      = signal<PolicySummaryDTO[]>([]);
  loading       = signal(true);
  totalElements = signal(0);
  currentPage   = signal(0);
  totalPages    = signal(0);

  // Panel de detalle
  selectedPolicyId   = signal<string | null>(null);
  selectedPolicyName = signal<string>('');

  // Formulario crear/editar
  isFormOpen    = signal(false);
  editingPolicy = signal<PolicyDetailDTO | null>(null); // null = crear, objeto = editar

  private activeFilter: PolicyFilter = {};
  readonly PAGE_SIZE = 10;

  ngOnInit(): void { this.loadPolicies(); }

  loadPolicies(): void {
    this.loading.set(true);
    this.policySvc.getAll(this.activeFilter, this.currentPage(), this.PAGE_SIZE).subscribe({
      next: (res) => {
        this.policies.set(res.content);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFilterChange(filter: PolicyFilter): void {
    this.activeFilter = filter;
    this.currentPage.set(0);
    this.loadPolicies();
  }

  changePage(step: number): void {
    const target = this.currentPage() + step;
    if (target >= 0 && target < this.totalPages()) {
      this.currentPage.set(target);
      this.loadPolicies();
    }
  }

  // ── Detalle ───────────────────────────────────────────────────────────────
  openDetail(policy: PolicySummaryDTO): void {
    this.selectedPolicyId.set(policy.id);
    this.selectedPolicyName.set(policy.name);
  }

  closeDetail(): void { this.selectedPolicyId.set(null); }

  // ── Eliminar (desde el modal de detalle) ──────────────────────────────────
  onRequestDelete(policy: PolicyDetailDTO): void {
    console.log('calling delete with id', policy.id);
    this.policySvc.delete(policy.id).subscribe({
      next: () => { console.log('deleted ok'); this.closeDetail(); this.loadPolicies(); },
      error: (e) => { console.error('delete error', e); },
    });
  }

  // ── Crear ─────────────────────────────────────────────────────────────────
  openCreateForm(): void {
    this.editingPolicy.set(null);
    this.isFormOpen.set(true);
  }

  // ── Editar (desde el modal de detalle) ────────────────────────────────────
  onRequestEdit(policy: PolicyDetailDTO): void {
    this.closeDetail();               // cierra el panel de detalle
    this.editingPolicy.set(policy);   // pasa los datos al form
    this.isFormOpen.set(true);        // abre el form en modo edición
  }

  // ── Cerrar form ───────────────────────────────────────────────────────────
  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingPolicy.set(null);
  }

  onFormSaved(): void {
    this.closeForm();
    this.loadPolicies();
  }

  // ── Helpers presentación ──────────────────────────────────────────────────
  severityClass(severity: string): string {
    const map: Record<string, string> = { CRITICAL: 'badge--critical', HIGH: 'badge--high', MEDIUM: 'badge--medium', LOW: 'badge--low' };
    return map[severity] ?? '';
  }

  severityLabel(severity: string): string {
    const map: Record<string, string> = { CRITICAL: 'Crítica', HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' };
    return map[severity] ?? severity;
  }
}