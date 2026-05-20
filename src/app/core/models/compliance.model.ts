export interface CheckComplianceDTO {
  checkId:       string;
  checkName:     string;
  rationale:     string | null;
  passed:        boolean | null;   // null = sin resultado aún
  detail:        string | null;
  actualValue:   string | null;
  expectedValue: string | null;
  executedAt:    string | null;
}

export interface ElementComplianceDTO {
  elementId:    string;
  elementName:  string;
  totalChecks:  number;
  passedChecks: number;
  score:        number;
  lastUpdated:  string | null;
  checks:       CheckComplianceDTO[];
}

export interface PolicyComplianceDTO {
  policyId:      string;
  policyName:    string;
  policyVersion: string;
  severity:      string;
  globalScore:   number;
  totalChecks:   number;
  passedChecks:  number;
  elements:      ElementComplianceDTO[];
}