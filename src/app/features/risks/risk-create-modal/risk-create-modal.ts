import { Component, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskService } from '../../../core/services/risk';
import { ThreatService } from '../../../core/services/threat';
import { AgentService } from '../../../core/services/agent';
import { ThreatDTO } from '../../../core/models/threat.model';
import { AgentDTO } from '../../../core/models/agent.model';
import { RiskCreateDTO } from '../../../core/models/risk.model';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorBanner } from '../../../shared/components/error-banner/error-banner';

@Component({
  selector: 'app-risk-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinner, ErrorBanner],
  templateUrl: './risk-create-modal.html',
  styleUrl: './risk-create-modal.scss',
})
export class RiskCreateModal implements OnInit {
  @Output() created = new EventEmitter<void>();
  @Output() closed  = new EventEmitter<void>();

  private riskSvc   = inject(RiskService);
  private threatSvc = inject(ThreatService);
  private agentSvc  = inject(AgentService);

  threats       = signal<ThreatDTO[]>([]);
  agents        = signal<AgentDTO[]>([]);
  loadingData   = signal(true);
  loadError     = signal(false);

  // Form values
  selectedThreatId = '';
  selectedAgentId  = '';
  impact           = 0.5;
  probability      = 0.5;

  submitting  = signal(false);
  submitError = signal('');

  // Búsqueda en selectores
  threatSearch = '';
  agentSearch  = '';

  get filteredThreats(): ThreatDTO[] {
    const q = this.threatSearch.toLowerCase();
    return q ? this.threats().filter(t => t.name.toLowerCase().includes(q)) : this.threats();
  }

  get filteredAgents(): AgentDTO[] {
    const q = this.agentSearch.toLowerCase();
    return q ? this.agents().filter(a =>
      a.hostname.toLowerCase().includes(q) || a.ip.includes(q)
    ) : this.agents();
  }

  get selectedThreat(): ThreatDTO | null {
    return this.threats().find(t => t.id === this.selectedThreatId) ?? null;
  }

  get selectedAgent(): AgentDTO | null {
    return this.agents().find(a => a.id === this.selectedAgentId) ?? null;
  }

  get score(): number {
    return Math.round(this.impact * this.probability * 100) / 100;
  }

  get isValid(): boolean {
    return !!this.selectedThreatId && !!this.selectedAgentId &&
           this.impact > 0 && this.impact <= 1 &&
           this.probability > 0 && this.probability <= 1;
  }

  ngOnInit() {
    let done = 0;
    const check = () => { if (++done === 2) this.loadingData.set(false); };

    this.threatSvc.getAll(0, 200).subscribe({
      next: p => { this.threats.set(p.content); check(); },
      error: () => { this.loadError.set(true); this.loadingData.set(false); },
    });

    this.agentSvc.getAll({}, 0, 200).subscribe({
      next: p => { this.agents.set(p.content); check(); },
      error: () => { this.loadError.set(true); this.loadingData.set(false); },
    });
  }

  submit() {
    if (!this.isValid || this.submitting()) return;
    this.submitting.set(true);
    this.submitError.set('');
    const dto: RiskCreateDTO = {
      threatId:    this.selectedThreatId,
      agentId:     this.selectedAgentId,
      impact:      this.impact,
      probability: this.probability,
    };
    this.riskSvc.create(dto).subscribe({
      next: () => { this.submitting.set(false); this.created.emit(); },
      error: () => { this.submitError.set('Error al crear el riesgo.'); this.submitting.set(false); },
    });
  }

  close() { this.closed.emit(); }
}