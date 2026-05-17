import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyService } from '../../../core/services/policy';

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
export class PolicyForm {
  private policySvc = inject(PolicyService);

  @Output() cancelled = new EventEmitter<void>();
  @Output() created   = new EventEmitter<void>();

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
  elements = signal<ElementDraft[]>([]);

  submitting = signal(false);
  submitError = signal('');

  // ── Validación básica ─────────────────────────────────────────────────────
  get isValid(): boolean {
    if (!this.name.trim() || !this.version.trim() || !this.description.trim()) return false;
    for (const el of this.elements()) {
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
  addElement() {
    this.elements.update(els => [
      ...els,
      { _id: uid(), name: '', checks: [], expanded: true },
    ]);
  }

  removeElement(elId: string) {
    this.elements.update(els => els.filter(e => e._id !== elId));
  }

  toggleElement(el: ElementDraft) {
    this.elements.update(els =>
      els.map(e => e._id === el._id ? { ...e, expanded: !e.expanded } : e)
    );
  }

  updateElementName(el: ElementDraft, name: string) {
    this.elements.update(els =>
      els.map(e => e._id === el._id ? { ...e, name } : e)
    );
  }

  // ── Checks ────────────────────────────────────────────────────────────────
  addCheck(elId: string) {
    this.elements.update(els =>
      els.map(e => e._id !== elId ? e : {
        ...e,
        checks: [...e.checks, {
          _id: uid(), name: '', checkCommand: '', rationale: '', remediations: [], expanded: true,
        }],
      })
    );
  }

  removeCheck(elId: string, ckId: string) {
    this.elements.update(els =>
      els.map(e => e._id !== elId ? e : {
        ...e, checks: e.checks.filter(c => c._id !== ckId),
      })
    );
  }

  toggleCheck(elId: string, ck: CheckDraft) {
    this.elements.update(els =>
      els.map(e => e._id !== elId ? e : {
        ...e, checks: e.checks.map(c => c._id === ck._id ? { ...c, expanded: !c.expanded } : c),
      })
    );
  }

  updateCheck(elId: string, ckId: string, patch: Partial<CheckDraft>) {
    this.elements.update(els =>
      els.map(e => e._id !== elId ? e : {
        ...e, checks: e.checks.map(c => c._id !== ckId ? c : { ...c, ...patch }),
      })
    );
  }

  // ── Remediaciones ─────────────────────────────────────────────────────────
  addRemediation(elId: string, ckId: string) {
    this.elements.update(els =>
      els.map(e => e._id !== elId ? e : {
        ...e,
        checks: e.checks.map(c => c._id !== ckId ? c : {
          ...c,
          remediations: [...c.remediations, {
            _id: uid(), name: '', description: '', remediationCommand: '',
          }],
        }),
      })
    );
  }

  removeRemediation(elId: string, ckId: string, rId: string) {
    this.elements.update(els =>
      els.map(e => e._id !== elId ? e : {
        ...e,
        checks: e.checks.map(c => c._id !== ckId ? c : {
          ...c, remediations: c.remediations.filter(r => r._id !== rId),
        }),
      })
    );
  }

  updateRemediation(elId: string, ckId: string, rId: string, patch: Partial<{ name: string; description: string; remediationCommand: string }>) {
    this.elements.update(els =>
      els.map(e => e._id !== elId ? e : {
        ...e,
        checks: e.checks.map(c => c._id !== ckId ? c : {
          ...c,
          remediations: c.remediations.map(r => r._id !== rId ? r : { ...r, ...patch }),
        }),
      })
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submit() {
    if (!this.isValid || this.submitting()) return;
    this.submitting.set(true);
    this.submitError.set('');

    const payload = {
      name:        this.name.trim(),
      version:     this.version.trim(),
      description: this.description.trim(),
      severity:    this.severity,
      status:      this.status,
      elements:    this.elements().map(el => ({
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

    this.policySvc.create(payload).subscribe({
      next: () => this.created.emit(),
      error: (err) => {
        this.submitError.set('Error al crear la política. Comprueba los datos.');
        this.submitting.set(false);
      },
    });
  }

  cancel() { this.cancelled.emit(); }

  severityLabel(s: string): string {
    const m: Record<string, string> = { CRITICAL: 'Crítica', HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' };
    return m[s] ?? s;
  }

  severityClass(s: string): string {
    const m: Record<string, string> = { CRITICAL: 'sev--critical', HIGH: 'sev--high', MEDIUM: 'sev--medium', LOW: 'sev--low' };
    return m[s] ?? '';
  }
}