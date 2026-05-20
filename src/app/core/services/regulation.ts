import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../api.config';
import { Page } from '../models/pagination.model';
import {
  RegulationSummaryDTO,
  RegulationDetailDTO,
  RegulationCreateDTO,
  RegulationUpdateDTO,
  RegSectionCreateDTO,
  RegulationFilter
} from '../models/regulation.model';

@Injectable({ providedIn: 'root' })
export class regulation {
  private http = inject(HttpClient);

  getAll(filter: RegulationFilter = {}, page = 0, size = 20, sort?: string): Observable<Page<RegulationSummaryDTO>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (sort) params = params.set('sort', sort);
    if (filter.name) params = params.set('name', filter.name);

    return this.http.get<Page<RegulationSummaryDTO>>(API.regulations.base, { params });
  }

  getById(id: string): Observable<RegulationDetailDTO> {
    return this.http.get<RegulationDetailDTO>(API.regulations.byId(id));
  }

  create(dto: RegulationCreateDTO): Observable<RegulationDetailDTO> {
    return this.http.post<RegulationDetailDTO>(API.regulations.base, dto);
  }

  update(id: string, dto: RegulationUpdateDTO): Observable<RegulationDetailDTO> {
    return this.http.put<RegulationDetailDTO>(API.regulations.byId(id), dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(API.regulations.byId(id));
  }

  addSection(regulationId: string, dto: RegSectionCreateDTO): Observable<RegulationDetailDTO> {
    return this.http.post<RegulationDetailDTO>(`${API.regulations.byId(regulationId)}/sections`, dto);
  }

  uploadPdf(id: string, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('pdf', file, file.name);
    return this.http.post<void>(API.regulations.uploadPdf(id), formData);
  }
}