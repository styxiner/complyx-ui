import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, Modal],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.scss'],
})
export class ConfirmDialog {
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Estás seguro de que deseas continuar? Esta acción no se puede deshacer.';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() danger = true;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}