import { Component, inject, signal, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { regulation } from '../../../core/services/regulation';
import { PolicyService } from '../../../core/services/policy';
import { RegulationDetailDTO } from '../../../core/models/regulation.model';
import { PolicySummaryDTO, PolicyDetailDTO, PolicyUpdateDTO, PolicyStatus } from '../../../core/models/policy.model';

export interface SectionDraft {
  _id: string;
  id?: string;
  title: string;
}

let _seq = 0;
const uid = () => `_draft_sec_${++_seq}`;

// ─── Estado de vinculación de una política existente ──────────────────────────
export interface PolicyLinkState {
  policy: PolicySummaryDTO;
  /** IDs de sección actualmente seleccionadas para vincular */
  selectedSectionIds: Set<string>;
  /** Indica si está abierto el panel de secciones */
  expanded: boolean;
  /** true mientras se ejecuta el PUT */
  saving: boolean;
  /** Mensaje de error específico de esta política */
  error: string;
}

@Component({
  selector: 'app-regulation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './regulation-form.html',
  styleUrl: './regulation-form.scss'
})
export class RegulationForm implements OnInit {
  @Input() editRegulation: RegulationDetailDTO | null = null;
  @Output() cancelled = new EventEmitter<void>();
  @Output() saved     = new EventEmitter<void>();

  private regulationSvc = inject(regulation);
  private policySvc     = inject(PolicyService);

  name = '';
  sections: SectionDraft[] = [];
  selectedFile: File | null = null;

  submitting  = signal<boolean>(false);
  submitError = signal<string>('');

  // ── Políticas asociadas (sólo en modo edición) ──────────────────────────────
  linkedPolicies  = signal<PolicyLinkState[]>([]);
  policiesLoading = signal<boolean>(false);
  policiesError   = signal<string>('');

  get isEditMode(): boolean { return !!this.editRegulation; }
  get title(): string       { return this.isEditMode ? 'Editar Marco Regulatorio' : 'Nuevo Marco Regulatorio'; }

  ngOnInit(): void {
    if (this.editRegulation) {
      this.name = this.editRegulation.name ?? '';
      this.sections = (this.editRegulation.sections ?? []).map(s => ({
        _id: s.id,
        id:  s.id,
        title: s.title
      }));
      // Cargamos las políticas que referencian esta normativa
      this.loadLinkedPolicies(this.editRegulation.id);
    }
  }

  // ── Carga políticas vinculadas vía GET /api/policies?regulationId=XYZ ───────
  private loadLinkedPolicies(regulationId: string): void {
    this.policiesLoading.set(true);
    this.policiesError.set('');

    this.policySvc.getAll({}, 0, 100).subscribe({
      next: (page) => {
        const states: PolicyLinkState[] = (page.content ?? []).map(p => ({
          policy:             p,
          selectedSectionIds: new Set<string>(),
          expanded:           false,
          saving:             false,
          error:              ''
        }));
        this.linkedPolicies.set(states);
        this.policiesLoading.set(false);
      },
      error: () => {
        this.policiesError.set('No se pudieron cargar las políticas asociadas.');
        this.policiesLoading.set(false);
      }
    });
  }

  // ── Alterna el panel de secciones de una política ───────────────────────────
  togglePolicyExpand(index: number): void {
    const states = [...this.linkedPolicies()];
    states[index] = { ...states[index], expanded: !states[index].expanded };
    this.linkedPolicies.set(states);
  }

  // ── Marca / desmarca una sección para una política concreta ─────────────────
  toggleSectionLink(policyIndex: number, sectionId: string): void {
    const states = [...this.linkedPolicies()];
    const state  = { ...states[policyIndex] };
    const ids    = new Set(state.selectedSectionIds);

    if (ids.has(sectionId)) {
      ids.delete(sectionId);
    } else {
      ids.add(sectionId);
    }

    state.selectedSectionIds = ids;
    states[policyIndex] = state;
    this.linkedPolicies.set(states);
  }

  isSectionSelected(policyIndex: number, sectionId: string): boolean {
    return this.linkedPolicies()[policyIndex]?.selectedSectionIds.has(sectionId) ?? false;
  }

  /**
   * Vincula las secciones seleccionadas a la política.
   *
   * El backend no expone un endpoint PUT /api/policies/:id/sections dedicado,
   * pero sí PUT /api/policies/:id (PolicyUpdateDTO). Aquí enviamos un update
   * que propaga los regulationSectionIds a los checks de la política.
   *
   * Si prefieres un endpoint más granular en el futuro, este es el único
   * método que necesitarás cambiar.
   */
  saveSectionLinks(policyIndex: number): void {
    const states = [...this.linkedPolicies()];
    const state  = states[policyIndex];
    const sectionIds = Array.from(state.selectedSectionIds);

    if (sectionIds.length === 0) {
      states[policyIndex] = { ...state, error: 'Selecciona al menos una sección.' };
      this.linkedPolicies.set(states);
      return;
    }

    states[policyIndex] = { ...state, saving: true, error: '' };
    this.linkedPolicies.set(states);

    // Primero obtenemos el detalle completo de la política para no pisar sus datos
    this.policySvc.getById(state.policy.id).subscribe({
      next: (detail: PolicyDetailDTO) => {
        // Construimos el UpdateDTO propagando los sectionIds a todos los checks
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
              // Añadimos (merge) los IDs nuevos a los que ya tenía el check
              regulationSectionIds: Array.from(
                new Set([...(ch.regulationSectionIds ?? []), ...sectionIds])
              ),
              remediations: ch.remediations ?? []
            }))
          }))
        };

        this.policySvc.update(state.policy.id, updatePayload).subscribe({
          next: () => {
            const updated = [...this.linkedPolicies()];
            updated[policyIndex] = {
              ...updated[policyIndex],
              saving:   false,
              error:    '',
              expanded: false,
              selectedSectionIds: new Set()
            };
            this.linkedPolicies.set(updated);
          },
          error: (err) => {
            const updated = [...this.linkedPolicies()];
            updated[policyIndex] = {
              ...updated[policyIndex],
              saving: false,
              error: err?.error?.message ?? 'Error al guardar la vinculación.'
            };
            this.linkedPolicies.set(updated);
          }
        });
      },
      error: () => {
        const updated = [...this.linkedPolicies()];
        updated[policyIndex] = {
          ...updated[policyIndex],
          saving: false,
          error: 'No se pudo obtener el detalle de la política.'
        };
        this.linkedPolicies.set(updated);
      }
    });
  }

  // ── Formulario de normativa ──────────────────────────────────────────────────
  get isValid(): boolean {
    if (!this.name.trim() || this.sections.length === 0) return false;
    return this.sections.every(s => s.title.trim().length > 0);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.submitError.set('El archivo adjunto debe ser de tipo PDF.');
        this.selectedFile = null;
        return;
      }
      this.submitError.set('');
      this.selectedFile = file;
    }
  }

  addSection(): void {
    this.sections = [...this.sections, { _id: uid(), title: '' }];
  }

  removeSection(id: string): void {
    this.sections = this.sections.filter(s => s._id !== id);
  }

  submit(): void {
    if (!this.isValid || this.submitting()) return;
    this.submitting.set(true);
    this.submitError.set('');

    if (this.isEditMode) {
      this.regulationSvc.update(this.editRegulation!.id, { name: this.name.trim() }).pipe(
        switchMap(() => this.handlePdfUpload(this.editRegulation!.id))
      ).subscribe({
        next: () => { this.submitting.set(false); this.saved.emit(); },
        error: () => {
          this.submitError.set('Error en el servidor al actualizar la normativa.');
          this.submitting.set(false);
        }
      });
    } else {
      this.regulationSvc.create({ name: this.name.trim() }).pipe(
        switchMap((newReg) => {
          const sectionRequests: Observable<any>[] = this.sections.map(s =>
            this.regulationSvc.addSection(newReg.id, { title: s.title.trim() })
          );
          const runSections$ = sectionRequests.length > 0 ? forkJoin(sectionRequests) : of([]);
          return runSections$.pipe(switchMap(() => of(newReg)));
        }),
        switchMap((newReg) => this.handlePdfUpload(newReg.id))
      ).subscribe({
        next: () => { this.submitting.set(false); this.saved.emit(); },
        error: () => {
          this.submitError.set('Error transaccional en cascada: comprueba la disponibilidad del backend.');
          this.submitting.set(false);
        }
      });
    }
  }

  private handlePdfUpload(id: string): Observable<any> {
    if (this.selectedFile) {
      return this.regulationSvc.uploadPdf(id, this.selectedFile);
    }
    return of(null);
  }

  cancel(): void { this.cancelled.emit(); }
}