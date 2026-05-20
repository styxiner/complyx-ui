import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentsCard }            from '../widgets/agents-card/agents-card';
import { PoliciesCard }          from '../widgets/policies-card/policies-card';
import { RisksCard }             from '../widgets/risks-card/risks-card';
import { ComplianceCard }        from '../widgets/compliance-card/compliance-card';
import { AgentStatusChart }      from '../widgets/agent-status-chart/agent-status-chart';
import { RiskDistributionChart } from '../widgets/risk-distribution-chart/risk-distribution-chart';
import { ComplianceChart }       from '../widgets/compliance-chart/compliance-chart';
import { RiskEvolutionChart }    from '../widgets/risk-evolution-chart/risk-evolution-chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AgentsCard, PoliciesCard, RisksCard, ComplianceCard,
    AgentStatusChart, RiskDistributionChart, ComplianceChart, RiskEvolutionChart,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}