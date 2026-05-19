// ── Enums ─────────────────────────────────────────────────────────────────────

export type RiskLevel  = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskStatus = 'OPEN' | 'ACCEPTED' | 'TRANSFERRED' | 'MITIGATED' | 'MONITORING' | 'CLOSED';

// ── DTOs de listado ───────────────────────────────────────────────────────────

export interface RiskDTO {
  id:            string;
  threatName:    string;
  agentHostname: string;
  impact:        number;
  riskLevel:     RiskLevel;
  status:        RiskStatus;
}

// ── DTO de detalle ────────────────────────────────────────────────────────────

export interface ThreatDTO {
  id:            string;
  name:          string;
  category:      string;
  severityScore: number;
}

export interface RiskDetailDTO {
  id:              string;
  threat:          ThreatDTO;
  agent:           { id: string; hostname: string; ip: string; osName: string; osVersion: string; enabled: boolean; groups: string[] };
  impact:          number;
  probability:     number;
  riskLevel:       RiskLevel;
  riskStatus:      RiskStatus;
  policySummaryDto: PolicySummaryRef[];
  createdDate:     string;
}

export interface PolicySummaryRef {
  id:       string;
  name:     string;
  version:  string;
  severity: string;
  status:   string;
}

// ── DTOs de escritura ─────────────────────────────────────────────────────────

export interface RiskCreateDTO {
  threatId:    string;
  agentId:     string;
  impact:      number;
  probability: number;
}

export interface RiskUpdateDTO {
  impact?:      number;
  probability?: number;
  reviewDate?:  string;
}

// ── Filtro ────────────────────────────────────────────────────────────────────

export interface RiskFilter {
  agentId?:   string;
  status?:    RiskStatus;
  riskLevel?: RiskLevel;
  threatId?:  string;
}

// ── Metadatos de presentación ─────────────────────────────────────────────────

export const RISK_STATUS_META: Record<RiskStatus, { label: string; color: string }> = {
  OPEN:        { label: 'Abierto',       color: 'status--open'        },
  ACCEPTED:    { label: 'Aceptado',      color: 'status--accepted'    },
  TRANSFERRED: { label: 'Transferido',   color: 'status--transferred' },
  MITIGATED:   { label: 'Mitigado',      color: 'status--mitigated'   },
  MONITORING:  { label: 'Monitorizado',  color: 'status--monitoring'  },
  CLOSED:      { label: 'Cerrado',       color: 'status--closed'      },
};

export const RISK_LEVEL_META: Record<RiskLevel, { label: string; color: string }> = {
  LOW:      { label: 'Bajo',     color: 'level--low'      },
  MEDIUM:   { label: 'Medio',    color: 'level--medium'   },
  HIGH:     { label: 'Alto',     color: 'level--high'     },
  CRITICAL: { label: 'Crítico',  color: 'level--critical' },
};

// Transiciones válidas por estado
export const RISK_TRANSITIONS: Record<RiskStatus, RiskStatus[]> = {
  OPEN:        ['ACCEPTED', 'TRANSFERRED', 'MONITORING'],
  ACCEPTED:    ['MONITORING', 'CLOSED'],
  TRANSFERRED: ['MONITORING', 'CLOSED'],
  MONITORING:  ['MITIGATED', 'CLOSED'],
  MITIGATED:   ['CLOSED'],
  CLOSED:      [],
};