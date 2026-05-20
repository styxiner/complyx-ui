import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgentService } from '../../../../core/services/agent';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-agents-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agents-card.html',
  styleUrl: './agents-card.scss',
})
export class AgentsCard implements OnInit {
  private svc = inject(AgentService);

  total    = signal(0);
  active   = signal(0);
  inactive = signal(0);
  loading  = signal(true);

  ngOnInit() {
    forkJoin({
      all:      this.svc.getAll({}, 0, 1),
      active:   this.svc.getAll({ enabled: true  }, 0, 1),
      inactive: this.svc.getAll({ enabled: false }, 0, 1),
    }).subscribe({
      next: (r) => {
        this.total.set(r.all.totalElements);
        this.active.set(r.active.totalElements);
        this.inactive.set(r.inactive.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}