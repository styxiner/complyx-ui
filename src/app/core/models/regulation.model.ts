export interface RegSectionDTO {
  id: string;
  title: string;
}

// DTO para alimentar el catálogo de tarjetas visuales (Resumen)
export interface RegulationSummaryDTO {
  id: string;
  name: string;
  addedDate: string; // LocalDateTime mapeado como String ISO
}

// DTO para el panel de detalles profundo (Sincronizado con la Entidad de Spring Boot)
export interface RegulationDetailDTO {
  id: string;
  name: string;
  pdfPath: string | null; 
  sections: RegSectionDTO[];
}

export interface RegulationCreateDTO {
  name: string;
}

export interface RegulationUpdateDTO {
  name: string;
}

export interface RegSectionCreateDTO {
  title: string;
}

export interface RegulationFilter {
  name?: string;
}