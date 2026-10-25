import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  Bidang,
  BidangInput,
  BidangListResponse,
  BidangResponse,
  Page,
  SortOrder,
  SuccessResponse,
} from '../models/api.models';
import { collectPages } from '../util/pagination';

export type BidangSort = 'id' | 'bidang';

export interface BidangQuery {
  id?: number;
  sort: BidangSort;
  order: SortOrder;
}

@Service()
export class BidangService {
  private readonly http = inject(HttpClient);

  listPage(query: BidangQuery): Observable<Page<Bidang>> {
    let params = new HttpParams().set('sort', query.sort).set('order', query.order);
    if (query.id !== undefined) params = params.set('id', query.id.toString());

    return this.http.get<BidangListResponse>(`${environment.apiBaseUrl}/bidang`, { params }).pipe(
      map((response) => ({
        items: response.bidang ?? [],
        nextId: response.next_id,
        hasMore: response.has_more,
      })),
    );
  }

  listAll(): Observable<Bidang[]> {
    return collectPages((id) =>
      this.listPage({
        id: id ?? undefined,
        sort: 'bidang',
        order: 'asc',
      }),
    );
  }

  get(id: number): Observable<Bidang> {
    return this.http
      .get<BidangResponse>(`${environment.apiBaseUrl}/bidang/${id}`)
      .pipe(map((response) => response.bidang));
  }

  create(input: BidangInput): Observable<void> {
    return this.http
      .post<SuccessResponse>(`${environment.apiBaseUrl}/bidang`, input)
      .pipe(map(() => undefined));
  }

  update(id: number, input: BidangInput): Observable<void> {
    return this.http
      .put<SuccessResponse>(`${environment.apiBaseUrl}/bidang/${id}`, input)
      .pipe(map(() => undefined));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<SuccessResponse>(`${environment.apiBaseUrl}/bidang/${id}`)
      .pipe(map(() => undefined));
  }
}
