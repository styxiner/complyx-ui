import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyFilter, Severity } from '../../../core/models/policy.model';
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

  readonly severityOptions: FilterOption[] = [
    { value: 'CRITICAL', label: 'Crítica' },
    { value: 'HIGH',     label: 'Alta' },
    { value: 'MEDIUM',   label: 'Media' },
    { value: 'LOW',      label: 'Baja' },
  ];

  onSearch(term: string)          { this.name = term;                           this.emit(); }
  onSeverityChange(v: string | null) { this.severity = v as Severity | null;    this.emit(); }

  private emit() {
    const f: PolicyFilter = {};
    if (this.name)     f.name = this.name;
    if (this.severity) f.severity = this.severity;
    this.filterChange.emit(f);
  }
}