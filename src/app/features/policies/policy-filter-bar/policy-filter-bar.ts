import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyFilter, PolicyStatus, Severity } from '../../../core/models/policy.model';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { FilterDropdown, FilterOption } from '../../../shared/components/filter-dropdown/filter-dropdown';

@Component({
  selector: 'app-policy-filter-bar',
  standalone: true,
  imports: [CommonModule, SearchBar, FilterDropdown],
  templateUrl: './policy-filter-bar.html',
  styleUrl: './policy-filter-bar.scss',
})
export class PolicyFilterBar {
  @Output() filterChange = new EventEmitter<PolicyFilter>();

  private name: string = '';
  private severity: Severity | null = null;
  private status: PolicyStatus | null = null;

  readonly severityOptions: FilterOption[] = [
    { value: 'CRITICAL', label: 'Crítica' },
    { value: 'HIGH',     label: 'Alta'    },
    { value: 'MEDIUM',   label: 'Media'   },
    { value: 'LOW',      label: 'Baja'    },
  ];

  readonly statusOptions: FilterOption[] = [
    { value: 'DRAFT',    label: 'Borrador'  },
    { value: 'ACTIVE',   label: 'Activa'    },
    { value: 'INACTIVE', label: 'Inactiva'  },
    { value: 'ARCHIVED', label: 'Archivada' },
  ];

  onSearch(term: string)                 { this.name     = term;                          this.emit(); }
  onSeverityChange(v: string | null)     { this.severity = v as Severity | null;          this.emit(); }
  onStatusChange(v: string | null)       { this.status   = v as PolicyStatus | null;      this.emit(); }

  private emit(): void {
    const f: PolicyFilter = {};
    if (this.name)     f.name     = this.name;
    if (this.severity) f.severity = this.severity;
    if (this.status)   f.status   = this.status;
    this.filterChange.emit(f);
  }
}