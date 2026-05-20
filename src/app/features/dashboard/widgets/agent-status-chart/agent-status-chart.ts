import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../../core/services/agent';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-agent-status-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-status-chart.html',
  styleUrl: './agent-status-chart.scss',
})
export class AgentStatusChart implements OnInit {
  private svc = inject(AgentService);

  active   = signal(0);
  inactive = signal(0);
  loading  = signal(true);

  get total() { return this.active() + this.inactive(); }

  get activePct()   { return this.total ? Math.round(this.active()   / this.total * 100) : 0; }
  get inactivePct() { return this.total ? Math.round(this.inactive() / this.total * 100) : 0; }

  // SVG donut: radio 40, circunferencia = 2π×40 ≈ 251.2
  readonly r  = 40;
  readonly cx = 251.2;

  get activeOffset()   { return 0; }
  get inactiveDash()   { return this.activePct * this.cx / 100; }
  get inactiveOffset() { return this.inactiveDash; }
  get activeDash()     { return this.inactivePct * this.cx / 100; }

  ngOnInit() {
    forkJoin({
      active:   this.svc.getAll({ enabled: true  }, 0, 1),
      inactive: this.svc.getAll({ enabled: false }, 0, 1),
    }).subscribe({
      next: (r) => {
        this.active.set(r.active.totalElements);
        this.inactive.set(r.inactive.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}