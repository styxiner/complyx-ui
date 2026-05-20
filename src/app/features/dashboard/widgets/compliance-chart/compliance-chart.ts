import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgentService } from '../../../../core/services/agent';
import { PolicyService } from '../../../../core/services/policy';
import { ComplianceService } from '../../../../core/services/compliance';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface BarItem { label: string; score: number; agentId: string; policyId: string; }

@Component({
  selector: 'app-compliance-chart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './compliance-chart.html',
  styleUrl: './compliance-chart.scss',
})
export class ComplianceChart implements OnInit {
  private agentSvc      = inject(AgentService);
  private policySvc     = inject(PolicyService);
  private complianceSvc = inject(ComplianceService);

  bars    = signal<BarItem[]>([]);
  loading = signal(true);

  ngOnInit() {
    forkJoin({
      agents:   this.agentSvc.getAll({ enabled: true }, 0, 6),
      policies: this.policySvc.getAll({ status: 'ACTIVE' } as any, 0, 1),
    }).pipe(
      switchMap(({ agents, policies }) => {
        if (!policies.content.length || !agents.content.length) return of([]);
        const policy = policies.content[0];
        return forkJoin(
          agents.content.map(a =>
            this.complianceSvc.getCompliance(a.id, policy.id).pipe()
          )
        ).pipe(
          switchMap(results => of(
            agents.content.map((a, i) => ({
              label:    a.hostname,
              score:    (results[i] as any)?.globalScore ?? 0,
              agentId:  a.id,
              policyId: policy.id,
            }))
          ))
        );
      })
    ).subscribe({
      next: (bars: any) => { this.bars.set(bars); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  scoreColor(score: number): string {
    if (score >= 90) return '#4ade80';
    if (score >= 50) return '#facc15';
    return '#f87171';
  }
}