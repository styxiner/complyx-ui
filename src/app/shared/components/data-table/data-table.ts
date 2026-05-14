import {
  Component, Input, Output, EventEmitter,
  ContentChildren, QueryList, AfterContentInit,
  TemplateRef, Directive,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { EmptyState } from '../empty-state/empty-state';

// ── Column definition directive ───────────────────────────────────────────────
@Directive({ selector: '[appColumn]', standalone: true })
export class ColumnDef {
  @Input('appColumn') key = '';
  @Input() header = '';
  @Input() sortable = false;
  @Input() width = '';
  constructor(public template: TemplateRef<any>) {}
}

export interface SortEvent { key: string; direction: 'asc' | 'desc'; }
export interface PageEvent  { page: number; pageSize: number; }

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, LoadingSpinner, EmptyState,], //ColumnDef],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.scss'],
})
export class DataTable<T = any> implements AfterContentInit {
  @ContentChildren(ColumnDef) columnDefs!: QueryList<ColumnDef>;

  @Input() rows: T[] = [];
  @Input() loading = false;
  @Input() total = 0;          // total de registros en el servidor
  @Input() page = 1;
  @Input() pageSize = 20;
  @Input() pageSizeOptions = [10, 20, 50];
  @Input() sortKey = '';
  @Input() sortDir: 'asc' | 'desc' = 'asc';
  @Input() emptyMessage = 'No hay datos que mostrar.';
  @Input() rowClass: (row: T) => string = () => '';

  @Output() rowClick   = new EventEmitter<T>();
  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() pageChange = new EventEmitter<PageEvent>();

  columns: ColumnDef[] = [];

  ngAfterContentInit() {
    this.columns = this.columnDefs.toArray();
    this.columnDefs.changes.subscribe(() => {
      this.columns = this.columnDefs.toArray();
    });
  }

  get pageEnd(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const delta = 2;
    const start = Math.max(2, this.page - delta);
    const end   = Math.min(this.totalPages - 1, this.page + delta);
    pages.push(1);
    if (start > 2) pages.push(-1); // ellipsis
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < this.totalPages - 1) pages.push(-1);
    if (this.totalPages > 1) pages.push(this.totalPages);
    return pages;
  }

  sort(col: ColumnDef) {
    if (!col.sortable) return;
    const direction = this.sortKey === col.key && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ key: col.key, direction });
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.pageChange.emit({ page: p, pageSize: this.pageSize });
  }

  changePageSize(size: number) {
    this.pageChange.emit({ page: 1, pageSize: size });
  }
}