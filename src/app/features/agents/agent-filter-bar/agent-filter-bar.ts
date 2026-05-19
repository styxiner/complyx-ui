import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentFilter } from '../../../core/models/agent.model';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { FilterDropdown, FilterOption } from '../../../shared/components/filter-dropdown/filter-dropdown';

@Component({
  selector: 'app-agent-filter-bar',
  standalone: true,
  imports: [CommonModule, SearchBar, FilterDropdown],
  templateUrl: './agent-filter-bar.html',
  styleUrl: './agent-filter-bar.scss',
})
export class AgentFilterBar {
  @Output() filterChange = new EventEmitter<AgentFilter>();

  private hostname: string        = '';
  private osName:   string | null = null;
  private enabled:  boolean | null = null;

  readonly osOptions: FilterOption[] = [
    { value: 'linux',   label: 'Linux'   },
    { value: 'windows', label: 'Windows' },
  ];

  readonly statusOptions: FilterOption[] = [
    { value: 'true',  label: 'Activo'   },
    { value: 'false', label: 'Inactivo' },
  ];

  onSearch(term: string)              { this.hostname = term;                              this.emit(); }
  onOsChange(v: string | null)        { this.osName  = v;                                 this.emit(); }
  onStatusChange(v: string | null)    { this.enabled = v === null ? null : v === 'true';  this.emit(); }

  private emit() {
    const f: AgentFilter = {};
    if (this.hostname)       f.hostname = this.hostname;
    if (this.osName)         f.osName   = this.osName;
    if (this.enabled !== null) f.enabled = this.enabled;
    this.filterChange.emit(f);
  }
}