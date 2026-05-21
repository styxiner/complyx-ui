import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThreatService } from '../../../core/services/threat';
import { ThreatDTO, ThreatCreateDTO, ThreatUpdateDTO } from '../../../core/models/threat.model';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorBanner } from '../../../shared/components/error-banner/error-banner';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

type Mode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-threat-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinner, ErrorBanner, EmptyState, ConfirmDialog],
  templateUrl: './threat-list.html',
  styleUrl: './threat-list.scss',
})
export class ThreatList implements OnInit {
  private svc = inject(ThreatService);

  threats       = signal<ThreatDTO[]>([]);
  loading       = signal(false);
  error         = signal(false);
  totalElements = signal(0);
  totalPages    = signal(0);
  page          = 0;
  pageSize      = 20;

  mode          = signal<Mode>('list');
  editingThreat = signal<ThreatDTO | null>(null);

  // Form
  formName          = '';
  formDescription   = '';
  formCategory      = '';
  formSeverityScore = 0.5;
  formError         = signal('');
  formSaving        = signal(false);

  // Delete
  threatToDelete    = signal<ThreatDTO | null>(null);
  showDeleteConfirm = signal(false);

  // Search
  searchQuery = '';

  get isValid(): boolean {
    return !!this.formName.trim() && !!this.formCategory.trim() &&
           this.formSeverityScore > 0 && this.formSeverityScore <= 10;
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true); this.error.set(false);
    this.svc.getAll(this.page, this.pageSize).subscribe({
      next: (p) => {
        this.threats.set(p.content);
        this.totalElements.set(p.totalElements);
        this.totalPages.set(p.totalPages);
        this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  onPageChange(step: number) {
    const next = this.page + step;
    if (next >= 0 && next < this.totalPages()) { this.page = next; this.load(); }
  }

  // ── Crear ─────────────────────────────────────────────────────────────────
  openCreate() {
    this.formName = ''; this.formDescription = '';
    this.formCategory = ''; this.formSeverityScore = 0.5;
    this.formError.set(''); this.editingThreat.set(null);
    this.mode.set('create');
  }

  // ── Editar ────────────────────────────────────────────────────────────────
  openEdit(t: ThreatDTO) {
    this.formName = t.name; this.formDescription = '';
    this.formCategory = t.category; this.formSeverityScore = t.severityScore;
    this.formError.set(''); this.editingThreat.set(t);
    this.mode.set('edit');
  }

  cancelForm() { this.mode.set('list'); }

  submitForm() {
    if (!this.isValid || this.formSaving()) return;
    this.formSaving.set(true); this.formError.set('');

    if (this.mode() === 'create') {
      const dto: ThreatCreateDTO = {
        name: this.formName.trim(),
        description: this.formDescription.trim() || undefined,
        category: this.formCategory.trim(),
        severityScore: this.formSeverityScore,
      };
      this.svc.create(dto).subscribe({
        next: () => { this.formSaving.set(false); this.mode.set('list'); this.load(); },
        error: () => { this.formError.set('Error al crear la amenaza.'); this.formSaving.set(false); },
      });
    } else {
      const t = this.editingThreat()!;
      const dto: ThreatUpdateDTO = {
        category: this.formCategory.trim(),
        severityScore: this.formSeverityScore,
        description: this.formDescription.trim() || undefined,
      };
      this.svc.update(t.id, dto).subscribe({
        next: () => { this.formSaving.set(false); this.mode.set('list'); this.load(); },
        error: () => { this.formError.set('Error al actualizar la amenaza.'); this.formSaving.set(false); },
      });
    }
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────
  requestDelete(t: ThreatDTO) { this.threatToDelete.set(t); this.showDeleteConfirm.set(true); }
  cancelDelete()              { this.showDeleteConfirm.set(false); }

  confirmDelete() {
    const t = this.threatToDelete(); if (!t) return;
    this.svc.delete(t.id).subscribe({
      next: () => { this.showDeleteConfirm.set(false); this.threatToDelete.set(null); this.load(); },
      error: () => this.showDeleteConfirm.set(false),
    });
  }

  scoreColor(s: number): string {
    if (s >= 8) return 'score--critical';
    if (s >= 6) return 'score--high';
    if (s >= 4) return 'score--medium';
    return 'score--low';
  }
}