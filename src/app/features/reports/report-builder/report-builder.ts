import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AgentService }      from '../../../core/services/agent';
import { PolicyService }     from '../../../core/services/policy';
import { RiskService }       from '../../../core/services/risk';
import { ThreatService }     from '../../../core/services/threat';
import { ReportPreviewPanel } from '../report-preview-panel/report-preview-panel';

export type ReportType = 'system' | 'risks';

export interface SystemReportData {
  generatedAt:    string;
  totalAgents:    number;
  activeAgents:   number;
  inactiveAgents: number;
  totalPolicies:  number;
  activePolicies: number;
  totalRisks:     number;
  openRisks:      number;
  criticalRisks:  number;
  risksByLevel:   Record<string, number>;
  topThreats:     { name: string; category: string; score: number }[];
}

export interface RisksReportData {
  generatedAt: string;
  risks: {
    id:           string;
    threatName:   string;
    agentHostname:string;
    impact:       number;
    riskLevel:    string;
    status:       string;
  }[];
  total:    number;
  open:     number;
  critical: number;
}

@Component({
  selector: 'app-report-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ReportPreviewPanel],
  templateUrl: './report-builder.html',
  styleUrl: './report-builder.scss',
})
export class ReportBuilder {
  private agentSvc  = inject(AgentService);
  private policySvc = inject(PolicyService);
  private riskSvc   = inject(RiskService);
  private threatSvc = inject(ThreatService);

  reportType   = signal<ReportType>('system');
  loading      = signal(false);
  generated    = signal(false);

  systemData = signal<SystemReportData | null>(null);
  risksData  = signal<RisksReportData | null>(null);

  // Opciones de filtro para riesgos
  filterStatus: string = '';
  filterLevel:  string = '';

  readonly STATUS_OPTIONS = ['OPEN','ACCEPTED','TRANSFERRED','MONITORING','MITIGATED','CLOSED'];
  readonly LEVEL_OPTIONS  = ['CRITICAL','HIGH','MEDIUM','LOW'];

  setType(t: ReportType) {
    this.reportType.set(t);
    this.generated.set(false);
    this.systemData.set(null);
    this.risksData.set(null);
  }

  generate() {
    this.loading.set(true);
    this.generated.set(false);

    if (this.reportType() === 'system') {
      this.generateSystem();
    } else {
      this.generateRisks();
    }
  }

  private generateSystem() {
    forkJoin({
      agents:         this.agentSvc.getAll({}, 0, 1),
      activeAgents:   this.agentSvc.getAll({ enabled: true  }, 0, 1),
      inactiveAgents: this.agentSvc.getAll({ enabled: false }, 0, 1),
      policies:       this.policySvc.getAll({}, 0, 1),
      activePolicies: this.policySvc.getAll({ status: 'ACTIVE' } as any, 0, 1),
      risks:          this.riskSvc.getAll({}, 0, 1),
      openRisks:      this.riskSvc.getAll({ status: 'OPEN' }, 0, 1),
      criticalRisks:  this.riskSvc.getAll({ riskLevel: 'CRITICAL' }, 0, 1),
      highRisks:      this.riskSvc.getAll({ riskLevel: 'HIGH'     }, 0, 1),
      mediumRisks:    this.riskSvc.getAll({ riskLevel: 'MEDIUM'   }, 0, 1),
      lowRisks:       this.riskSvc.getAll({ riskLevel: 'LOW'      }, 0, 1),
      threats:        this.threatSvc.getAll(0, 10),
    }).subscribe({
      next: (r) => {
        this.systemData.set({
          generatedAt:    new Date().toISOString(),
          totalAgents:    r.agents.totalElements,
          activeAgents:   r.activeAgents.totalElements,
          inactiveAgents: r.inactiveAgents.totalElements,
          totalPolicies:  r.policies.totalElements,
          activePolicies: r.activePolicies.totalElements,
          totalRisks:     r.risks.totalElements,
          openRisks:      r.openRisks.totalElements,
          criticalRisks:  r.criticalRisks.totalElements,
          risksByLevel: {
            CRITICAL: r.criticalRisks.totalElements,
            HIGH:     r.highRisks.totalElements,
            MEDIUM:   r.mediumRisks.totalElements,
            LOW:      r.lowRisks.totalElements,
          },
          topThreats: r.threats.content.map((t: any) => ({
            name:     t.name,
            category: t.category,
            score:    t.severityScore,
          })),
        });
        this.loading.set(false);
        this.generated.set(true);
      },
      error: () => this.loading.set(false),
    });
  }

  private generateRisks() {
    const filter: any = {};
    if (this.filterStatus) filter.status    = this.filterStatus;
    if (this.filterLevel)  filter.riskLevel = this.filterLevel;

    forkJoin({
      risks:    this.riskSvc.getAll(filter, 0, 200),
      open:     this.riskSvc.getAll({ ...filter, status: 'OPEN'     }, 0, 1),
      critical: this.riskSvc.getAll({ ...filter, riskLevel: 'CRITICAL' }, 0, 1),
    }).subscribe({
      next: (r) => {
        this.risksData.set({
          generatedAt: new Date().toISOString(),
          risks:       r.risks.content,
          total:       r.risks.totalElements,
          open:        r.open.totalElements,
          critical:    r.critical.totalElements,
        });
        this.loading.set(false);
        this.generated.set(true);
      },
      error: () => this.loading.set(false),
    });
  }

  print() {
    window.print();
  }
}