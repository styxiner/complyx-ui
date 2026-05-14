import { Pipe, PipeTransform } from '@angular/core';

const LABELS: Record<string, string> = {
  CRITICAL: 'Crítico',
  HIGH:     'Alto',
  MEDIUM:   'Medio',
  LOW:      'Bajo',
  INFO:     'Informativo',
  // inglés y español indistintamente
  critical: 'Crítico',
  high:     'Alto',
  medium:   'Medio',
  low:      'Bajo',
  info:     'Informativo',
};

@Pipe({ name: 'severityLabel', standalone: true })
export class SeverityLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    return LABELS[value] ?? value;
  }
}