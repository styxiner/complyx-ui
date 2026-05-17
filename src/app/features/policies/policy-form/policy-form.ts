import { Component, inject, signal, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyService } from '../../../core/services/policy';
import {
  PolicyDetailDTO, CheckParams, CheckType, RemediationParams, RemediationType,
  CHECK_TYPE_META, CheckTypeMeta, REMEDIATION_TYPE_META, RemediationTypeMeta,
  CompareOperator, COMPARE_OPERATORS, UserAttrCheck,
} from '../../../core/models/policy.model';

// ── Drafts ────────────────────────────────────────────────────────────────────

export interface RemediationDraft {
  _id: string;
  name: string;
  description: string;
  remediationParams: Partial<RemediationParams> & { type: RemediationType };
}

export interface CheckDraft {
  _id: string; name: string; rationale: string;
  checkParams: Partial<CheckParams> & { type: CheckType };
  remediations: RemediationDraft[];
  expanded: boolean;
}

export interface ElementDraft {
  _id: string; name: string; checks: CheckDraft[]; expanded: boolean;
}

let _seq = 0;
const uid = () => `_${++_seq}`;

function defaultCheckParams(type: CheckType): Partial<CheckParams> & { type: CheckType } {
  switch (type) {
    case 'file_exists':    return { type, path: '' };
    case 'file_absent':    return { type, path: '' };
    case 'file_block':     return { type, path: '', must_contain: [], must_not_contain: [], match_mode: 'regex' };
    case 'file_line':      return { type, path: '', key: '', operator: '=', value: '' };
    case 'ini_value':      return { type, path: '', key: '', operator: '=', value: '', section: null };
    case 'dir_contains':   return { type, path: '', must_contain: true };
    case 'symlink':        return { type, path: '' };
    case 'pkg_installed':  return { type, name: '', package_manager: 'auto' };
    case 'pkg_absent':     return { type, name: '', package_manager: 'auto' };
    case 'service':        return { type, name: '', active: true, enabled: true };
    case 'sysctl':         return { type, key: '', operator: '=', value: '' };
    case 'user_attr':      return { type, username: '', checks: [] };
    default:               return { type };
  }
}

function defaultRemParams(type: RemediationType): Partial<RemediationParams> & { type: RemediationType } {
  switch (type) {
    case 'file_line_set':  return { type, path: '', key: '', value: '', backup: true, create_if_absent: true };
    case 'file_block_set': return { type, path: '', block: '', backup: true };
    case 'pkg_install':    return { type, name: '', package_manager: 'auto' };
    case 'pkg_remove':     return { type, name: '', purge: false, package_manager: 'auto' };
    case 'service_set':    return { type, name: '', active: true, enabled: true };
    case 'sysctl_set':     return { type, key: '', value: '' };
    default:               return { type };
  }
}

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policy-form.html',
  styleUrl: './policy-form.scss',
})
export class PolicyForm implements OnInit {
  @Input() editPolicy: PolicyDetailDTO | null = null;
  @Output() cancelled = new EventEmitter<void>();
  @Output() saved     = new EventEmitter<void>();

  private policySvc = inject(PolicyService);

  name = ''; version = ''; description = '';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' = 'DRAFT';

  readonly severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
  readonly statuses   = [
    { value: 'DRAFT',    label: 'Borrador'  },
    { value: 'ACTIVE',   label: 'Activa'    },
    { value: 'INACTIVE', label: 'Inactiva'  },
    { value: 'ARCHIVED', label: 'Archivada' },
  ] as const;

  readonly checkTypeMeta: CheckTypeMeta[]           = CHECK_TYPE_META;
  readonly remTypeMeta: RemediationTypeMeta[]        = REMEDIATION_TYPE_META;
  readonly checkTypesByCategory                      = this.groupBy(CHECK_TYPE_META, 'category', { filesystem: 'Sistema de ficheros', package: 'Paquetes', system: 'Sistema', user: 'Usuarios' });
  readonly remTypesByCategory                        = this.groupBy(REMEDIATION_TYPE_META, 'category', { filesystem: 'Sistema de ficheros', package: 'Paquetes', system: 'Sistema' });
  readonly operators: { value: CompareOperator; label: string }[] = COMPARE_OPERATORS;

  elements: ElementDraft[] = [];
  submitting  = signal(false);
  submitError = signal('');

  get isEditMode(): boolean   { return !!this.editPolicy; }
  get title(): string         { return this.isEditMode ? 'Editar política' : 'Nueva política'; }
  get subtitle(): string      { return this.isEditMode ? 'Modifica y guarda los cambios' : 'Define nombre, severidad y checks'; }
  get totalElements(): number { return this.elements.length; }
  get totalChecks(): number   { return this.elements.reduce((s, e) => s + e.checks.length, 0); }

  ngOnInit(): void {
    if (!this.editPolicy) return;
    const p = this.editPolicy;
    this.name = p.name ?? ''; this.version = p.version ?? '';
    this.description = p.description ?? '';
    this.severity = (p.severity as any) ?? 'MEDIUM';
    this.status   = (p.status   as any) ?? 'DRAFT';
    this.elements = (p.elements ?? []).map(el => ({
      _id: el.id ?? uid(), name: el.name ?? '', expanded: false,
      checks: (el.checks ?? []).map(ck => ({
        _id: ck.id ?? uid(), name: ck.name ?? '', rationale: ck.rationale ?? '',
        checkParams: (ck.checkParams ?? { type: 'file_exists' }) as any,
        expanded: false,
        remediations: (ck.remediations ?? []).map(r => ({
          _id: r.id ?? uid(), name: r.name ?? '', description: r.description ?? '',
          remediationParams: (r.remediationParams ?? { type: 'file_line_set' }) as any,
        })),
      })),
    }));
  }

  get isValid(): boolean {
    if (!this.name.trim() || !this.version.trim() || !this.description.trim()) return false;
    for (const el of this.elements) {
      if (!el.name.trim()) return false;
      for (const ck of el.checks) {
        if (!ck.name.trim()) return false;
        for (const r of ck.remediations) {
          if (!r.name.trim()) return false;
        }
      }
    }
    return true;
  }

  // ── Elementos ─────────────────────────────────────────────────────────────
  addElement()                    { this.elements = [...this.elements, { _id: uid(), name: '', checks: [], expanded: true }]; }
  removeElement(id: string)       { this.elements = this.elements.filter(e => e._id !== id); }
  toggleElement(el: ElementDraft) { el.expanded = !el.expanded; this.elements = [...this.elements]; }

  // ── Checks ────────────────────────────────────────────────────────────────
  addCheck(el: ElementDraft): void {
    el.checks = [...el.checks, { _id: uid(), name: '', rationale: '', checkParams: defaultCheckParams('file_exists'), remediations: [], expanded: true }];
    this.elements = [...this.elements];
  }
  removeCheck(el: ElementDraft, id: string): void    { el.checks = el.checks.filter(c => c._id !== id); this.elements = [...this.elements]; }
  toggleCheck(el: ElementDraft, ck: CheckDraft): void { ck.expanded = !ck.expanded; this.elements = [...this.elements]; }
  onCheckTypeChange(el: ElementDraft, ck: CheckDraft, t: CheckType): void { ck.checkParams = defaultCheckParams(t); this.elements = [...this.elements]; }

  // ── Remediaciones ─────────────────────────────────────────────────────────
  addRemediation(el: ElementDraft, ck: CheckDraft): void {
    ck.remediations = [...ck.remediations, { _id: uid(), name: '', description: '', remediationParams: defaultRemParams('file_line_set') }];
    this.elements = [...this.elements];
  }
  removeRemediation(el: ElementDraft, ck: CheckDraft, id: string): void {
    ck.remediations = ck.remediations.filter(r => r._id !== id); this.elements = [...this.elements];
  }
  onRemTypeChange(el: ElementDraft, ck: CheckDraft, r: RemediationDraft, t: RemediationType): void {
    r.remediationParams = defaultRemParams(t); this.elements = [...this.elements];
  }

  // ── Helpers params ────────────────────────────────────────────────────────
  cp(ck: CheckDraft): any { return ck.checkParams; }
  rp(r: RemediationDraft): any { return r.remediationParams; }

  addPattern(ck: CheckDraft, f: 'must_contain'|'must_not_contain'): void {
    (ck.checkParams as any)[f] = [...((ck.checkParams as any)[f] ?? []), '']; this.elements = [...this.elements];
  }
  removePattern(ck: CheckDraft, f: 'must_contain'|'must_not_contain', i: number): void {
    (ck.checkParams as any)[f] = (ck.checkParams as any)[f].filter((_: any, j: number) => j !== i); this.elements = [...this.elements];
  }
  updatePattern(ck: CheckDraft, f: 'must_contain'|'must_not_contain', i: number, v: string): void {
    (ck.checkParams as any)[f][i] = v;
  }

  getUserAttrChecks(ck: CheckDraft): UserAttrCheck[] { return (ck.checkParams as any).checks ?? []; }
  addUserAttrCheck(ck: CheckDraft): void { (ck.checkParams as any).checks = [...((ck.checkParams as any).checks ?? []), { attr: 'shell', operator: '=', value: '' }]; this.elements = [...this.elements]; }
  removeUserAttrCheck(ck: CheckDraft, i: number): void { (ck.checkParams as any).checks = (ck.checkParams as any).checks.filter((_: any, j: number) => j !== i); this.elements = [...this.elements]; }

  labelForCheckType(t: CheckType): string       { return CHECK_TYPE_META.find(m => m.type === t)?.label ?? t; }
  labelForRemType(t: RemediationType): string   { return REMEDIATION_TYPE_META.find(m => m.type === t)?.label ?? t; }

  private groupBy(meta: any[], key: string, labels: Record<string, string>) {
    return Object.entries(labels).map(([cat, label]) => ({ label, items: meta.filter(m => m[key] === cat) }));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submit(): void {
    if (!this.isValid || this.submitting()) return;
    this.submitting.set(true); this.submitError.set('');
    const payload = {
      name: this.name.trim(), version: this.version.trim(),
      description: this.description.trim(), severity: this.severity, status: this.status,
      elements: this.elements.map(el => ({
        name: el.name.trim(),
        checks: el.checks.map(ck => ({
          name: ck.name.trim(), rationale: ck.rationale.trim(),
          checkParams: ck.checkParams,
          remediations: ck.remediations.map(r => ({
            name: r.name.trim(), description: r.description.trim(),
            remediationParams: r.remediationParams,
          })),
        })),
      })),
    };
    const req$ = this.isEditMode
      ? this.policySvc.update(this.editPolicy!.id, payload as any)
      : this.policySvc.create(payload as any);
    req$.subscribe({
      next:  () => { this.submitting.set(false); this.saved.emit(); },
      error: () => { this.submitError.set('Error al guardar la política.'); this.submitting.set(false); },
    });
  }

  cancel(): void { this.cancelled.emit(); }
  severityLabel(s: string): string { return ({ CRITICAL: 'Crítica', HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' } as any)[s] ?? s; }
  severityClass(s: string): string { return ({ CRITICAL: 'sev--critical', HIGH: 'sev--high', MEDIUM: 'sev--medium', LOW: 'sev--low' } as any)[s] ?? ''; }
}