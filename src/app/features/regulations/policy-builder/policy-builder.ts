import { Component, inject, OnInit, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { PolicyService } from '../../../core/services/policy';
import { CHECK_TYPE_META, REMEDIATION_TYPE_META } from '../../../core/models/policy.model';

@Component({
  selector: 'app-policy-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'policy-builder.html',
  styleUrl: 'policy-builder.scss'
})
export class PolicyBuilder implements OnInit {
  private fb = inject(FormBuilder);
  private policySvc = inject(PolicyService);

  @Input() regulationId?: string;
  @Input() sections: { id: string, title: string }[] = [];
  @Output() saved = new EventEmitter<void>();

  checkTypes = CHECK_TYPE_META;
  remTypes   = REMEDIATION_TYPE_META;

  serverError  = signal<string>('');
  isSubmitting = signal<boolean>(false);

  policyForm: FormGroup = this.fb.group({
    name:        ['', Validators.required],
    description: ['', Validators.required],
    version:     ['1.0.0', Validators.required],
    severity:    ['MEDIUM'],
    status:      ['DRAFT'],
    elements:    this.fb.array([])
  });

  get elements(): FormArray { return this.policyForm.get('elements') as FormArray; }

  ngOnInit(): void {}

  addElement(): void {
    this.elements.push(this.fb.group({
      name:   ['', Validators.required],
      checks: this.fb.array([])
    }));
  }

  removeElement(i: number): void { this.elements.removeAt(i); }

  addCheck(elIndex: number): void {
    this.getChecks(elIndex).push(this.fb.group({
      name:                 ['', Validators.required],
      checkParams:          this.fb.group({ type: ['file_exists'] }),
      regulationSectionIds: [[]],
      remediations:         this.fb.array([])
    }));
  }

  removeCheck(elIndex: number, checkIndex: number): void {
    this.getChecks(elIndex).removeAt(checkIndex);
  }

  getChecks(elIndex: number): FormArray {
    return this.elements.at(elIndex).get('checks') as FormArray;
  }

  elementHasNoChecks(i: number): boolean {
    return this.getChecks(i).length === 0;
  }

  // Campos base OK + al menos 1 elemento + cada elemento tiene al menos 1 check
  get isFormReadyToSubmit(): boolean {
    const base = ['name', 'description', 'version'];
    const baseOk = base.every(f => {
      const ctrl = this.policyForm.get(f);
      return ctrl && ctrl.value && ctrl.value.toString().trim().length > 0;
    });
    if (!baseOk || this.elements.length === 0) return false;
    return this.elements.controls.every((_, i) => this.getChecks(i).length > 0);
  }

  get validationMessage(): string {
    const base = ['name', 'description', 'version'];
    const baseOk = base.every(f => {
      const ctrl = this.policyForm.get(f);
      return ctrl && ctrl.value && ctrl.value.toString().trim().length > 0;
    });
    if (!baseOk) return 'Rellena el nombre, descripción y versión.';
    if (this.elements.length === 0) return 'Añade al menos un elemento.';
    const emptyEl = this.elements.controls.findIndex((_, i) => this.getChecks(i).length === 0);
    if (emptyEl >= 0) return `El elemento #${emptyEl + 1} necesita al menos un check.`;
    return '';
  }

  save(): void {
    if (this.isSubmitting()) return;

    const msg = this.validationMessage;
    if (msg) {
      this.serverError.set(msg);
      return;
    }

    this.serverError.set('');
    this.isSubmitting.set(true);

    const raw = this.policyForm.value;

    const payload = {
      name:        raw.name.trim(),
      description: raw.description.trim(),
      version:     raw.version.trim(),
      severity:    raw.severity,
      status:      raw.status,
      elements:    (raw.elements ?? []).map((el: any) => ({
        name:   el.name,
        checks: (el.checks ?? []).map((ch: any) => ({
          name:                 ch.name,
          checkParams:          { type: ch.checkParams?.type ?? 'file_exists' },
          regulationSectionIds: Array.isArray(ch.regulationSectionIds)
                                  ? ch.regulationSectionIds
                                  : [],
          remediations: []
        }))
      }))
    };

    console.log('[PolicyBuilder] POST /api/policies', JSON.stringify(payload, null, 2));

    this.policySvc.create(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (err) => {
        console.error('[PolicyBuilder] Error:', err);
        const errMsg =
          err?.error?.message ??
          err?.error?.error   ??
          err?.message        ??
          `Error ${err?.status ?? ''}: problema al guardar.`;
        this.serverError.set(errMsg);
        this.isSubmitting.set(false);
      }
    });
  }
}