import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyService } from '../../../core/services/policy';
import { PolicySummaryDTO } from '../../../core/models/policy.model';

@Component({
  selector: 'app-policy-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policy-picker-modal.html',
  styleUrl:    './policy-picker-modal.scss',
})
export class PolicyPickerModal implements OnInit {
  /** IDs de políticas ya asignadas para excluirlas */
  @Input() assignedIds: string[] = [];
  @Output() assign = new EventEmitter<PolicySummaryDTO>();
  @Output() closed = new EventEmitter<void>();

  private svc = inject(PolicyService);

  all      = signal<PolicySummaryDTO[]>([]);
  filtered = signal<PolicySummaryDTO[]>([]);
  loading  = signal(true);
  error    = signal(false);
  query    = '';

  ngOnInit() {
    this.svc.getAll({}, 0, 200).subscribe({
      next: (page) => {
        const available = page.content.filter(p => !this.assignedIds.includes(p.id));
        this.all.set(available);
        this.filtered.set(available);
        this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  onSearch(q: string) {
    this.query = q;
    const lower = q.toLowerCase();
    this.filtered.set(
      lower ? this.all().filter(p => p.name.toLowerCase().includes(lower)) : this.all()
    );
  }

  select(p: PolicySummaryDTO) { this.assign.emit(p); }
  close()                     { this.closed.emit(); }

  severityClass(s: string): string {
    return ({ CRITICAL: 'sev--critical', HIGH: 'sev--high', MEDIUM: 'sev--medium', LOW: 'sev--low' } as any)[s] ?? '';
  }

  severityLabel(s: string): string {
    return ({ CRITICAL: 'Crítica', HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' } as any)[s] ?? s;
  }
}