import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.scss'],
})
export class SearchBar implements OnDestroy {
  @Input() placeholder = 'Buscar…';
  @Input() debounce = 300;
  @Output() search = new EventEmitter<string>();

  value = '';
  private input$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.input$.pipe(
      debounceTime(this.debounce),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(v => this.search.emit(v));
  }

  onInput(val: string) {
    this.value = val;
    this.input$.next(val);
  }

  clear() {
    this.value = '';
    this.search.emit('');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}