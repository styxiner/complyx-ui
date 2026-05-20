import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { regulation } from '../../../core/services/regulation';
import { PolicyService } from '../../../core/services/policy';
import { RegulationSummaryDTO, RegulationDetailDTO, RegulationFilter } from '../../../core/models/regulation.model';
import { RegulationDetailModal } from '../regulation-detail-modal/regulation-detail-modal';
import { RegulationForm } from '../regulation-form/regulation-form';

// RegulationSummaryDTO enriquecido con el contador de políticas
export interface RegulationRow extends RegulationSummaryDTO {
  policyCount: number;
}

@Component({
  selector: 'app-regulation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RegulationDetailModal, RegulationForm],
  templateUrl: './regulation-list.html',
  styleUrl: './regulation-list.scss'
})
export class RegulationList implements OnInit {
  private regulationSvc = inject(regulation);
  private policySvc     = inject(PolicyService);

  regulations  = signal<RegulationRow[]>([]);
  loading      = signal<boolean>(false);
  error        = signal<string>('');

  filter: RegulationFilter = { name: '' };
  currentPage   = 0;
  pageSize      = 20;
  totalElements = 0;

  selectedRegulationId = signal<string | null>(null);
  isModalOpen          = signal<boolean>(false);
  isFormOpen           = signal<boolean>(false);
  editingRegulation    = signal<RegulationDetailDTO | null>(null);

  ngOnInit(): void { this.loadRegulations(); }

  loadRegulations(): void {
    this.loading.set(true);
    this.regulationSvc.getAll(this.filter, this.currentPage, this.pageSize, 'name,asc')
      .subscribe({
        next: (page) => {
          const regs = page.content ?? [];
          this.totalElements = page.totalElements ?? 0;

          if (regs.length === 0) {
            this.regulations.set([]);
            this.loading.set(false);
            return;
          }

          // Para cada normativa pedimos sus políticas (Opción B: sin filtro de regulationId
          // porque el join en BD solo devuelve políticas ya vinculadas por sección.
          // Usamos regulationId para las que sí tienen vinculación, y el resto quedan en 0)
          const counts$ = regs.map(reg =>
            this.policySvc.getAll({ regulationId: reg.id }, 0, 1)
          );

          forkJoin(counts$).subscribe({
            next: (pages) => {
              const rows: RegulationRow[] = regs.map((reg, i) => ({
                ...reg,
                policyCount: pages[i]?.totalElements ?? 0
              }));
              this.regulations.set(rows);
              this.loading.set(false);
            },
            error: () => {
              // Si falla el conteo, mostramos las normativas igualmente con 0
              this.regulations.set(regs.map(r => ({ ...r, policyCount: 0 })));
              this.loading.set(false);
            }
          });
        },
        error: () => {
          this.error.set('Error de comunicación con el backend.');
          this.loading.set(false);
        }
      });
  }

  openCreateForm(): void {
    this.editingRegulation.set(null);
    this.isFormOpen.set(true);
  }

  openEditForm(id: string, event: Event): void {
    event.stopPropagation();
    this.regulationSvc.getById(id).subscribe(detail => {
      this.editingRegulation.set(detail);
      this.isFormOpen.set(true);
    });
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingRegulation.set(null);
  }

  onFormSaved(): void {
    this.closeForm();
    this.loadRegulations();
  }

deleteRegulation(id: string, event: Event): void {
  console.log('deleteRegulation llamado con id:', id);
  event.stopPropagation();
  event.preventDefault();
  
  // Temporal: sin confirm para probar
  console.log('procediendo a eliminar...');
  this.regulationSvc.delete(id).subscribe({
    next: () => {
      console.log('eliminado correctamente');
      this.loadRegulations();
    },
    error: (err) => {
      console.error('error al eliminar:', err);
      this.error.set(err?.error?.message ?? `Error ${err.status}`);
    }
  });
}
  openDetail(id: string): void {
    this.selectedRegulationId.set(id);
    this.isModalOpen.set(true);
  }

  closeDetail(): void {
    this.isModalOpen.set(false);
    this.selectedRegulationId.set(null);
  }

  onSearch(): void  { this.currentPage = 0; this.loadRegulations(); }
  nextPage(): void  { this.currentPage++; this.loadRegulations(); }
  prevPage(): void  { this.currentPage--; this.loadRegulations(); }
}