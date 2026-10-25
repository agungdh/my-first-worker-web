import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  Page,
  PangkatGolongan,
  PangkatGolonganInput,
  PangkatGolonganListResponse,
  PangkatGolonganResponse,
  SortOrder,
  SuccessResponse,
} from '../models/api.models';
import { collectPages } from '../util/pagination';

export type PangkatGolonganSort = 'id' | 'jenjang' | 'pangkat' | 'golongan' | 'ruang';

export interface PangkatGolonganQuery {
  cursor?: number;
  cursorValue?: string | null;
  sort: PangkatGolonganSort;
  order: SortOrder;
}

@Service()
export class PangkatGolonganService {
  private readonly http = inject(HttpClient);

  listPage(query: PangkatGolonganQuery): Observable<Page<PangkatGolongan>> {
    let params = new HttpParams().set('sort', query.sort).set('order', query.order);
    if (query.cursor !== undefined) params = params.set('cursor', query.cursor.toString());
    if (query.cursorValue != null) params = params.set('cursor_value', query.cursorValue);

    return this.http
      .get<PangkatGolonganListResponse>(`${environment.apiBaseUrl}/pangkat-golongan`, { params })
      .pipe(
        map((response) => ({
          items: response.pangkat_golongan ?? [],
          nextCursor: response.next_cursor,
          nextCursorValue: response.next_cursor_value,
          hasMore: response.has_more,
        })),
      );
  }

  listAll(): Observable<PangkatGolongan[]> {
    return collectPages((cursor) =>
      this.listPage({
        cursor: cursor?.id,
        cursorValue: cursor?.value,
        sort: 'golongan',
        order: 'asc',
      }),
    );
  }

  get(id: number): Observable<PangkatGolongan> {
    return this.http
      .get<PangkatGolonganResponse>(`${environment.apiBaseUrl}/pangkat-golongan/${id}`)
      .pipe(map((response) => response.pangkat_golongan));
  }

  create(input: PangkatGolonganInput): Observable<void> {
    return this.http
      .post<SuccessResponse>(`${environment.apiBaseUrl}/pangkat-golongan`, input)
      .pipe(map(() => undefined));
  }

  update(id: number, input: PangkatGolonganInput): Observable<void> {
    return this.http
      .put<SuccessResponse>(`${environment.apiBaseUrl}/pangkat-golongan/${id}`, input)
      .pipe(map(() => undefined));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<SuccessResponse>(`${environment.apiBaseUrl}/pangkat-golongan/${id}`)
      .pipe(map(() => undefined));
  }
}
