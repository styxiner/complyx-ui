import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-filter-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-dropdown.html',
  styleUrls: ['./filter-dropdown.scss'],
})
export class FilterDropdown {
  @Input() label = 'Filtrar';
  @Input() options: FilterOption[] = [];
  @Input() selected: string | null = null;
  @Output() selectedChange = new EventEmitter<string | null>();

  open = false;

  constructor(private el: ElementRef) {}

  get selectedLabel(): string {
    return this.options.find(o => o.value === this.selected)?.label ?? this.label;
  }

  select(value: string | null) {
    this.selected = value;
    this.selectedChange.emit(value);
    this.open = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.open = false;
    }
  }
}