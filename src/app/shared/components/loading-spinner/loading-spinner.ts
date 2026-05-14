import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.html',
  styleUrls: ['./loading-spinner.scss'],
})
export class LoadingSpinner {
  /** 'inline' usa tamaño pequeño dentro de botones/celdas.
   *  'page'   centra el spinner en toda la sección disponible. */
  @Input() mode: 'inline' | 'page' = 'page';
  @Input() message = '';
}