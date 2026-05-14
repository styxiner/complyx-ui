import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusVariant =
  | 'active' | 'inactive' | 'online' | 'offline'
  | 'critical' | 'high' | 'medium' | 'low' | 'info'
  | 'compliant' | 'non-compliant' | 'pending' | 'unknown';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrls: ['./status-badge.scss'],
})
export class StatusBadge {
  @Input() status: StatusVariant = 'unknown';
  @Input() label?: string;

  get displayLabel(): string {
    return this.label ?? this.status;
  }
}