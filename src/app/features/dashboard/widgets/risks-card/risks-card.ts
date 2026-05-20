import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RiskService } from '../../../../core/services/risk';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-risks-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './risks-card.html',
  styleUrl: './risks-card.scss',
})
export class RisksCard implements OnInit {
  private svc = inject(RiskService);

  total    = signal(0);
  open     = signal(0);
  critical = signal(0);
  loading  = signal(true);

  ngOnInit() {
    forkJoin({
      all:      this.svc.getAll({}, 0, 1),
      open:     this.svc.getAll({ status: 'OPEN' }, 0, 1),
      critical: this.svc.getAll({ riskLevel: 'CRITICAL' }, 0, 1),
    }).subscribe({
      next: (r) => {
        this.total.set(r.all.totalElements);
        this.open.set(r.open.totalElements);
        this.critical.set(r.critical.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}