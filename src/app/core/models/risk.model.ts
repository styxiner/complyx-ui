// ── Enums ─────────────────────────────────────────────────────────────────────
// El backend devuelve los valores en MAYÚSCULAS (conversión Spring @Enumerated)

export type RiskLevel  = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskStatus = 'OPEN' | 'ACCEPTED' | 'TRANSFERRED' | 'MITIGATED' | 'MONITORING' | 'CLOSED';

// ── DTOs de listado ───────────────────────────────────────────────────────────

export interface RiskDTO {
  id:            string;
  threatName:    string;
  agentHostname: string;
  impact:        number;   // escala 0–10
  riskLevel:     RiskLevel;
  status:        RiskStatus;
}

// ── DTO de detalle ────────────────────────────────────────────────────────────

export interface ThreatDTO {
  id:            string;
  name:          string;
  category:      string;
  severityScore: number;   // escala 0–10
}

export interface RiskDetailDTO {
  id:               string;
  threat:           ThreatDTO;
  agent:            { id: string; hostname: string; ip: string; osName: string; osVersion: string; enabled: boolean; groups: string[] };
  impact:           number;   // escala 0–10
  probability:      number;   // escala 0–10
  riskLevel:        RiskLevel;
  riskStatus:       RiskStatus;
  policySummaryDto: PolicySummaryRef[];
  createdDate:      string;
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
  impact:      number;   // 0–10
  probability: number;   // 0–10
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

export const RISK_STATUS_META: Record<RiskStatus, { label: string }> = {
  OPEN:        { label: 'Abierto'      },
  ACCEPTED:    { label: 'Aceptado'     },
  TRANSFERRED: { label: 'Transferido'  },
  MITIGATED:   { label: 'Mitigado'     },
  MONITORING:  { label: 'Monitorizado' },
  CLOSED:      { label: 'Cerrado'      },
};

export const RISK_LEVEL_META: Record<RiskLevel, { label: string }> = {
  LOW:      { label: 'Bajo'    },
  MEDIUM:   { label: 'Medio'   },
  HIGH:     { label: 'Alto'    },
  CRITICAL: { label: 'Crítico' },
};

// Transiciones válidas por estado (basadas en los endpoints reales del backend)
export const RISK_TRANSITIONS: Record<RiskStatus, RiskStatus[]> = {
  OPEN:        ['ACCEPTED', 'TRANSFERRED', 'MONITORING'],
  ACCEPTED:    ['MONITORING', 'CLOSED'],
  TRANSFERRED: ['MONITORING', 'CLOSED'],
  MONITORING:  ['MITIGATED', 'CLOSED'],
  MITIGATED:   ['CLOSED'],
  CLOSED:      [],
};