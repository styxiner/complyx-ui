export interface ThreatDTO {
  id:            string;
  name:          string;
  category:      string;
  severityScore: number;
}

export interface ThreatCreateDTO {
  name:          string;
  description?:  string;
  category:      string;
  severityScore: number;
}

export interface ThreatUpdateDTO {
  description?:  string;
  category?:     string;
  severityScore?: number;
}

export interface ThreatFilter {
  name?: string;
}