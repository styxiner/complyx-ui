// ─── Agente ───────────────────────────────────────────────────────────────────

export interface AgentDTO {
  id: string;
  ip: string;
  hostname: string;
  osName: string;
  osVersion: string;
  agentVersion?: string;
  enabled: boolean;
  registeredDate?: string;   // ISO 8601
  lastSeen?: string;         // ISO 8601
  groups: string[];          // Nombres de grupo (no UUIDs)
}

export interface AgentRegisterDTO {
  ip: string;
  hostname: string;
  osName: string;
  osVersion: string;
}

export interface AgentFilter {
  ip?: string;
  hostname?: string;
  osName?: string;
  enabled?: boolean;
  groupId?: string;
}

// ─── Grupos de agentes ────────────────────────────────────────────────────────

export interface AgentGroupDTO {
  id: string;
  name: string;
  description?: string;
  agents: string[];   // Nombres de los agentes del grupo
}

export interface AgentGroupCreateDTO {
  name: string;
  description?: string;
}

export interface AgentGroupUpdateDTO {
  name?: string;
  description?: string;
}

export interface AgentGroupFilter {
  name?: string;
  description?: string;
  agentId?: string;
}