import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgentService } from '../../../../core/services/agent';
import { PolicyService } from '../../../../core/services/policy';
import { ComplianceService } from '../../../../core/services/compliance';
import { forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-compliance-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './compliance-card.html',
  styleUrl: './compliance-card.scss',
})
export class ComplianceCard implements OnInit {
  private agentSvc      = inject(AgentService);
  private policySvc     = inject(PolicyService);
  private complianceSvc = inject(ComplianceService);

  avgScore    = signal<number | null>(null);
  evaluated   = signal(0);   // pares agente+política con resultados
  loading     = signal(true);

  ngOnInit() {
    // Carga los primeros 10 agentes activos y sus políticas activas
    // y calcula la media de globalScore
    forkJoin({
      agents:   this.agentSvc.getAll({ enabled: true }, 0, 10),
      policies: this.policySvc.getAll({ status: 'ACTIVE' } as any, 0, 10),
    }).pipe(
      switchMap(({ agents, policies }) => {
        const pairs: Array<{ agentId: string; policyId: string }> = [];
        agents.content.slice(0, 5).forEach(a =>
          policies.content.slice(0, 5).forEach(p =>
            pairs.push({ agentId: a.id, policyId: p.id })
          )
        );
        if (pairs.length === 0) return of([]);
        return forkJoin(
          pairs.map(pr =>
            this.complianceSvc.getCompliance(pr.agentId, pr.policyId)
          )
        );
      })
    ).subscribe({
      next: (results: any[]) => {
        const valid = results.filter(r => r && r.totalChecks > 0);
        this.evaluated.set(valid.length);
        if (valid.length > 0) {
          const avg = valid.reduce((s, r) => s + r.globalScore, 0) / valid.length;
          this.avgScore.set(Math.round(avg * 10) / 10);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  scoreClass(): string {
    const s = this.avgScore();
    if (s === null) return '';
    if (s >= 90) return 'score--pass';
    if (s >= 50) return 'score--warn';
    return 'score--fail';
  }
}