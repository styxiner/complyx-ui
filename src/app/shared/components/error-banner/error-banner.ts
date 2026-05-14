import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-banner.html',
  styleUrls: ['./error-banner.scss'],
})
export class ErrorBanner {
  @Input() message = 'Ha ocurrido un error inesperado.';
  @Input() dismissible = true;
  @Output() retry = new EventEmitter<void>();

  visible = true;
  dismiss() { this.visible = false; }
}