import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PolicyService } from '../../../../core/services/policy';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-policies-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './policies-card.html',
  styleUrl: './policies-card.scss',
})
export class PoliciesCard implements OnInit {
  private svc = inject(PolicyService);

  total   = signal(0);
  active  = signal(0);
  draft   = signal(0);
  loading = signal(true);

  ngOnInit() {
    forkJoin({
      all:    this.svc.getAll({}, 0, 1),
      active: this.svc.getAll({ status: 'ACTIVE' } as any, 0, 1),
      draft:  this.svc.getAll({ status: 'DRAFT'  } as any, 0, 1),
    }).subscribe({
      next: (r) => {
        this.total.set(r.all.totalElements);
        this.active.set(r.active.totalElements);
        this.draft.set(r.draft.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}