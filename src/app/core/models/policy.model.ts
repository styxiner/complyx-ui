// ─────────────────────────────────────────────────────────────────────────────
// policy.model.ts — DTOs exactos del backend (diagrama de clases + OpenAPI)
// ─────────────────────────────────────────────────────────────────────────────

export interface RemediationDraft {
  _id: string;
  name: string;
  description: string;
  remediationCommand: string;
}
 
export interface CheckDraft {
  _id: string;
  name: string;
  checkCommand: string;
  rationale: string;
  remediations: RemediationDraft[];
}
 
export interface ElementDraft {
  _id: string;
  name: string;
  checks: CheckDraft[];
}
 
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type PolicyStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
 
let _seq = 0;
export const uid = () => `_${++_seq}`;

// ── Listado ───────────────────────────────────────────────────────────────────

/** GET /api/policies  (paginado) */
export interface PolicySummaryDTO {
  id: string;
  name: string;
  version: string;
  severity: Severity;
  status: string;       // PolicyStatus — el OpenAPI lo devuelve como string
  createdAt: string;    // date-time ISO
}

// ── Detalle ───────────────────────────────────────────────────────────────────

/** GET /api/policies/{policyId} */
export interface PolicyDetailDTO {
  id: string;
  name: string;
  version: string;
  description: string;
  status: string;
  severity: Severity;
  createdAt: string;
  elements: PolicyElementDTO[];
}

export interface PolicyElementDTO {
  id: string;
  name: string;
  checks: PolicyCheckDTO[];
}

export interface PolicyCheckDTO {
  id: string;
  name: string;
  rationale: string;
  checkCommand: string;
  remediations: PolicyRemediationDTO[];
  regulationSectionIds: string[];   // UUIDs de secciones normativas vinculadas
}

export interface PolicyRemediationDTO {
  id: string;
  name: string;
  description: string;
}

// ── Crear ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/policies
 * Los elementos se pasan anidados en la creación según el OpenAPI.
 */
export interface PolicyCreateDTO {
  name: string;
  description: string;
  version: string;
  severity: Severity;
  status: PolicyStatus;
  elements: PolicyElementCreateDTO[];
}

export interface PolicyElementCreateDTO {
  name: string;
  description?: string;
  checks: PolicyCheckCreateDTO[];
}

export interface PolicyCheckCreateDTO {
  name: string;
  checkCommand: string;
  rationale?: string;
  remediations?: PolicyRemediationCreateDTO[];
  regulationSectionIds?: string[];
}

export interface PolicyRemediationCreateDTO {
  name: string;
  description: string;
  remediationCommand: string;
}

// ── Actualizar ────────────────────────────────────────────────────────────────

/**
 * PUT /api/policies/{policyId}
 * El backend acepta la política completa con sus elementos.
 * El diagrama muestra PolicyUpdateDTO con: name, version, description,
 * severity, status, elements (lista de PolicyElementUpdateDTO).
 */
export interface PolicyUpdateDTO {
  name: string;
  version: string;
  description: string;
  severity: Severity;
  status: PolicyStatus;
  elements: PolicyElementUpdateDTO[];
}

export interface PolicyElementUpdateDTO {
  id?: string;          // undefined = nuevo elemento
  name: string;
  description?: string;
  checks: PolicyCheckUpdateDTO[];
}

export interface PolicyCheckUpdateDTO {
  id?: string;          // undefined = nuevo check
  name: string;
  checkCommand: string;
  rationale?: string;
  remediations?: PolicyRemediationUpdateDTO[];
  regulationSectionIds?: string[];
}

export interface PolicyRemediationUpdateDTO {
  id?: string;
  name: string;
  description: string;
  remediationCommand: string;
}

// ── Filtro ────────────────────────────────────────────────────────────────────

export interface PolicyFilter {
  name?: string;
  severity?: Severity;
  assignedToAgentId?: string;
  assignedToGroupId?: string;
  includeUnassigned?: boolean;
}
