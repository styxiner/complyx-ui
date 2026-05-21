import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.html',
  styleUrls: ['./empty-state.scss'],
})
export class EmptyState {
  @Input() icon = '📭';
  @Input() title = 'Sin resultados';
  @Input() description = 'No hay datos que mostrar para los filtros aplicados.';
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}