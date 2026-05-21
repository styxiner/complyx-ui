import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskService } from '../../../../core/services/risk';
import { forkJoin } from 'rxjs';
import { RiskLevel } from '../../../../core/models/risk.model';

interface LevelData { level: RiskLevel; label: string; count: number; color: string; pct: number; }

@Component({
  selector: 'app-risk-distribution-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-distribution-chart.html',
  styleUrl: './risk-distribution-chart.scss',
})
export class RiskDistributionChart implements OnInit {
  private svc = inject(RiskService);

  data    = signal<LevelData[]>([]);
  total   = signal(0);
  loading = signal(true);

  private readonly META: Record<RiskLevel, { label: string; color: string }> = {
    CRITICAL: { label: 'Crítico', color: '#f87171' },
    HIGH:     { label: 'Alto',    color: '#fb923c' },
    MEDIUM:   { label: 'Medio',   color: '#facc15' },
    LOW:      { label: 'Bajo',    color: '#4ade80' },
  };

  ngOnInit() {
    const levels: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    forkJoin({
      critical: this.svc.getAll({ riskLevel: 'CRITICAL' }, 0, 1),
      high:     this.svc.getAll({ riskLevel: 'HIGH'     }, 0, 1),
      medium:   this.svc.getAll({ riskLevel: 'MEDIUM'   }, 0, 1),
      low:      this.svc.getAll({ riskLevel: 'LOW'      }, 0, 1),
    }).subscribe({
      next: (r) => {
        const counts = {
          CRITICAL: r.critical.totalElements,
          HIGH:     r.high.totalElements,
          MEDIUM:   r.medium.totalElements,
          LOW:      r.low.totalElements,
        };
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        this.total.set(total);
        this.data.set(levels.map(l => ({
          level: l,
          label: this.META[l].label,
          count: counts[l],
          color: this.META[l].color,
          pct:   total > 0 ? Math.round(counts[l] / total * 100) : 0,
        })));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // Genera offset SVG acumulativo para el donut
  dashOffset(index: number): number {
    const items = this.data();
    let offset = 62.8; // -90° = 251.2 * 0.25
    for (let i = 0; i < index; i++) {
      offset -= (items[i].pct * 2.512);
    }
    return offset;
  }
}