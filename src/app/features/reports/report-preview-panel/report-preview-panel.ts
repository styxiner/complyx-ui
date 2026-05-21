import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportType, SystemReportData, RisksReportData } from '../report-builder/report-builder';

@Component({
  selector: 'app-report-preview-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-preview-panel.html',
  styleUrl: './report-preview-panel.scss',
})
export class ReportPreviewPanel {
  @Input() type!:       ReportType;
  @Input() systemData!: SystemReportData | null;
  @Input() risksData!:  RisksReportData  | null;

  readonly LEVEL_COLOR: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH:     '#ea580c',
    MEDIUM:   '#ca8a04',
    LOW:      '#16a34a',
  };

  readonly STATUS_LABEL: Record<string, string> = {
    OPEN:        'Abierto',
    ACCEPTED:    'Aceptado',
    TRANSFERRED: 'Transferido',
    MONITORING:  'Monitorizado',
    MITIGATED:   'Mitigado',
    CLOSED:      'Cerrado',
  };

  readonly LEVEL_LABEL: Record<string, string> = {
    CRITICAL: 'Crítico',
    HIGH:     'Alto',
    MEDIUM:   'Medio',
    LOW:      'Bajo',
  };

  levelColor(l: string): string { return this.LEVEL_COLOR[l] ?? '#64748b'; }
  statusLabel(s: string): string { return this.STATUS_LABEL[s] ?? s; }
  levelLabel(l: string): string  { return this.LEVEL_LABEL[l] ?? l; }

  complianceRate(data: SystemReportData): number {
    if (!data.totalRisks) return 100;
    return Math.round((1 - data.openRisks / data.totalRisks) * 100);
  }

  barWidth(count: number, total: number): number {
    return total > 0 ? Math.round(count / total * 100) : 0;
  }
}