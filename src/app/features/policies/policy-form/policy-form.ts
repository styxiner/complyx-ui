import { Component, inject, signal, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyService } from '../../../core/services/policy';
import { PolicyDetailDTO } from '../../../core/models/policy.model';

export interface RemediationDraft {
  _id: string; name: string; description: string; remediationCommand: string;
}
export interface CheckDraft {
  _id: string; name: string; checkCommand: string; rationale: string;
  remediations: RemediationDraft[]; expanded: boolean;
}
export interface ElementDraft {
  _id: string; name: string; checks: CheckDraft[]; expanded: boolean;
}

let _seq = 0;
const uid = () => `_${++_seq}`;

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policy-form.html',
  styleUrl: './policy-form.scss',
})
export class PolicyForm implements OnInit {
  /** Si se pasa, el formulario entra en modo edición */
  @Input() editPolicy: PolicyDetailDTO | null = null;

  @Output() cancelled = new EventEmitter<void>();
  @Output() saved     = new EventEmitter<void>(); // reemplaza 'created' para unificar create y update

  private policySvc = inject(PolicyService);

  // ── Campos básicos ────────────────────────────────────────────────────────
  name        = '';
  version     = '';
  description = '';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' = 'DRAFT';

  readonly severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
  readonly statuses   = [
    { value: 'DRAFT',    label: 'Borrador' },
    { value: 'ACTIVE',   label: 'Activa' },
    { value: 'INACTIVE', label: 'Inactiva' },
    { value: 'ARCHIVED', label: 'Archivada' },
  ] as const;

  // ── Estado jerárquico ─────────────────────────────────────────────────────
  elements: ElementDraft[] = [];

  submitting  = signal(false);
  submitError = signal('');

  get isEditMode(): boolean { return !!this.editPolicy; }
  get title(): string { return this.isEditMode ? 'Editar política' : 'Nueva política'; }
  get subtitle(): string { return this.isEditMode ? 'Modifica los campos y guarda los cambios' : 'Define nombre, severidad y estructura de elementos y checks'; }

  // ── Contadores para el resumen ─────────────────────────────────────────────
  get totalElements(): number { return this.elements.length; }
  get totalChecks(): number   { return this.elements.reduce((s, e) => s + e.checks.length, 0); }

  // ── Ciclo de vida ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    if (this.editPolicy) {
      const p = this.editPolicy;
      this.name        = p.name        ?? '';
      this.version     = p.version     ?? '';
      this.description = p.description ?? '';
      this.severity    = (p.severity   as any) ?? 'MEDIUM';
      this.status      = (p.status     as any) ?? 'DRAFT';
      this.elements    = (p.elements ?? []).map(el => ({
        _id:      el.id ?? uid(),
        name:     el.name ?? '',
        expanded: false,
        checks:   (el.checks ?? []).map(ck => ({
          _id:          ck.id ?? uid(),
          name:         ck.name ?? '',
          checkCommand: ck.checkCommand ?? '',
          rationale:    ck.rationale ?? '',
          expanded:     false,
          remediations: (ck.remediations ?? []).map(r => ({
            _id:                r.id ?? uid(),
            name:               r.name ?? '',
            description:        r.description ?? '',
            remediationCommand: r.remediationCommand ?? '',
          })),
        })),
      }));
    }
  }

  // ── Validación ────────────────────────────────────────────────────────────
  get isValid(): boolean {
    if (!this.name.trim() || !this.version.trim() || !this.description.trim()) return false;
    for (const el of this.elements) {
      if (!el.name.trim()) return false;
      for (const ck of el.checks) {
        if (!ck.name.trim() || !ck.checkCommand.trim()) return false;
        for (const r of ck.remediations) {
          if (!r.name.trim() || !r.remediationCommand.trim()) return false;
        }
      }
    }
    return true;
  }

  // ── Elementos ─────────────────────────────────────────────────────────────
  addElement(): void {
    this.elements = [...this.elements, { _id: uid(), name: '', checks: [], expanded: true }];
  }

  removeElement(elId: string): void {
    this.elements = this.elements.filter(e => e._id !== elId);
  }

  toggleElement(el: ElementDraft): void {
    el.expanded = !el.expanded;
    this.elements = [...this.elements]; // trigger change detection
  }

  updateElementName(el: ElementDraft, name: string): void {
    el.name = name;
  }

  // ── Checks ────────────────────────────────────────────────────────────────
  addCheck(el: ElementDraft): void {
    el.checks = [...el.checks, { _id: uid(), name: '', checkCommand: '', rationale: '', remediations: [], expanded: true }];
    this.elements = [...this.elements];
  }

  removeCheck(el: ElementDraft, ckId: string): void {
    el.checks = el.checks.filter(c => c._id !== ckId);
    this.elements = [...this.elements];
  }

  toggleCheck(el: ElementDraft, ck: CheckDraft): void {
    ck.expanded = !ck.expanded;
    this.elements = [...this.elements];
  }

  // ── Remediaciones ─────────────────────────────────────────────────────────
  addRemediation(el: ElementDraft, ck: CheckDraft): void {
    ck.remediations = [...ck.remediations, { _id: uid(), name: '', description: '', remediationCommand: '' }];
    this.elements = [...this.elements];
  }

  removeRemediation(el: ElementDraft, ck: CheckDraft, rId: string): void {
    ck.remediations = ck.remediations.filter(r => r._id !== rId);
    this.elements = [...this.elements];
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submit(): void {
    if (!this.isValid || this.submitting()) return;
    this.submitting.set(true);
    this.submitError.set('');

    const payload = {
      name:        this.name.trim(),
      version:     this.version.trim(),
      description: this.description.trim(),
      severity:    this.severity,
      status:      this.status,
      elements:    this.elements.map(el => ({
        name:   el.name.trim(),
        checks: el.checks.map(ck => ({
          name:         ck.name.trim(),
          checkCommand: ck.checkCommand.trim(),
          rationale:    ck.rationale.trim(),
          remediations: ck.remediations.map(r => ({
            name:               r.name.trim(),
            description:        r.description.trim(),
            remediationCommand: r.remediationCommand.trim(),
          })),
        })),
      })),
    };

    const request$ = this.isEditMode
      ? this.policySvc.update(this.editPolicy!.id, payload)
      : this.policySvc.create(payload);

    request$.subscribe({
      next:  () => { this.submitting.set(false); this.saved.emit(); },
      error: () => { this.submitError.set('Error al guardar la política. Comprueba los datos.'); this.submitting.set(false); },
    });
  }

  cancel(): void { this.cancelled.emit(); }

  severityLabel(s: string): string {
    return ({ CRITICAL: 'Crítica', HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' } as any)[s] ?? s;
  }
  severityClass(s: string): string {
    return ({ CRITICAL: 'sev--critical', HIGH: 'sev--high', MEDIUM: 'sev--medium', LOW: 'sev--low' } as any)[s] ?? '';
  }
}