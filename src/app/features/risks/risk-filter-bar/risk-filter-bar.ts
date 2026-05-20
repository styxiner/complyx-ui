import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RiskFilter, RiskLevel, RiskStatus } from '../../../core/models/risk.model';
import { FilterDropdown, FilterOption } from '../../../shared/components/filter-dropdown/filter-dropdown';

@Component({
  selector: 'app-risk-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterDropdown],
  templateUrl: './risk-filter-bar.html',
  styleUrl: './risk-filter-bar.scss',
})
export class RiskFilterBar implements OnInit {
  @Output() filterChange = new EventEmitter<RiskFilter>();

  private route = inject(ActivatedRoute);

  private agentId:   string | null = null;
  private status:    RiskStatus | null = null;
  private riskLevel: RiskLevel | null = null;

  readonly statusOptions: FilterOption[] = [
    { value: 'OPEN',        label: 'Abierto'      },
    { value: 'ACCEPTED',    label: 'Aceptado'     },
    { value: 'TRANSFERRED', label: 'Transferido'  },
    { value: 'MONITORING',  label: 'Monitorizado' },
    { value: 'MITIGATED',   label: 'Mitigado'     },
    { value: 'CLOSED',      label: 'Cerrado'      },
  ];

  readonly levelOptions: FilterOption[] = [
    { value: 'CRITICAL', label: 'Crítico' },
    { value: 'HIGH',     label: 'Alto'    },
    { value: 'MEDIUM',   label: 'Medio'   },
    { value: 'LOW',      label: 'Bajo'    },
  ];

  ngOnInit() {
    // Permite llegar desde /agents/:id con ?agentId=xxx preseleccionado
    const qAgentId = this.route.snapshot.queryParamMap.get('agentId');
    if (qAgentId) { this.agentId = qAgentId; this.emit(); }
  }

  onStatusChange(v: string | null)    { this.status    = v as RiskStatus | null; this.emit(); }
  onLevelChange(v: string | null)     { this.riskLevel = v as RiskLevel | null;  this.emit(); }

  private emit() {
    const f: RiskFilter = {};
    if (this.agentId)   f.agentId   = this.agentId;
    if (this.status)    f.status    = this.status;
    if (this.riskLevel) f.riskLevel = this.riskLevel;
    this.filterChange.emit(f);
  }
}