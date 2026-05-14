import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-export-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './export-buttons.html',
  styleUrls: ['./export-buttons.scss'],
})
export class ExportButtons {
  @Input() showCsv = true;
  @Input() showPdf = true;
  @Input() loading = false;

  @Output() exportCsv = new EventEmitter<void>();
  @Output() exportPdf = new EventEmitter<void>();
}