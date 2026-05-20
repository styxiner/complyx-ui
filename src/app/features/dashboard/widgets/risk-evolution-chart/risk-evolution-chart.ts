import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskService } from '../../../../core/services/risk';

interface DayBucket { label: string; count: number; }

@Component({
  selector: 'app-risk-evolution-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-evolution-chart.html',
  styleUrl: './risk-evolution-chart.scss',
})
export class RiskEvolutionChart implements OnInit {
  private svc = inject(RiskService);

  buckets = signal<DayBucket[]>([]);
  loading = signal(true);
  maxVal  = signal(1);

  ngOnInit() {
    // Carga los 100 riesgos más recientes y los agrupa por día (últimos 14 días)
    this.svc.getAll({}, 0, 100).subscribe({
      next: (page) => {
        const today = new Date();
        const map = new Map<string, number>();

        // Inicializar últimos 14 días
        for (let i = 13; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          map.set(this.fmt(d), 0);
        }

        // Contar por día
        page.content.forEach((r: any) => {
          if (!r.createdDate) return;
          const key = this.fmt(new Date(r.createdDate));
          if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
        });

        const buckets = Array.from(map.entries()).map(([label, count]) => ({ label, count }));
        const max = Math.max(...buckets.map(b => b.count), 1);
        this.buckets.set(buckets);
        this.maxVal.set(max);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private fmt(d: Date): string {
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
  }

  barHeight(count: number): number {
    return this.maxVal() > 0 ? Math.round(count / this.maxVal() * 100) : 0;
  }

  showLabel(label: string, i: number): boolean {
    // Mostrar solo cada 2 etiquetas para no saturar
    return i % 2 === 0;
  }
}