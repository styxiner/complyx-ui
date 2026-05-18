export interface PageableObject {
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  offset: number;
  unpaged: boolean;
}

export interface SortObject {
  sorted: boolean;
  empty: boolean;
  unsorted: boolean;
}

// Estructura real que devuelve Spring Page<T>
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;       // página actual (0-indexed)
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
  pageable: PageableObject;
  sort: SortObject;
}