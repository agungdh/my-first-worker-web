import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  Bidang,
  BidangInput,
  BidangListResponse,
  BidangResponse,
  SuccessResponse,
} from '../models/api.models';
import { collectPages } from '../util/pagination';

@Service()
export class BidangService {
  private readonly http = inject(HttpClient);

  listPage(page: number): Observable<Bidang[]> {
    const params = new HttpParams().set('page', page.toString());

    return this.http
      .get<BidangListResponse>(`${environment.apiBaseUrl}/bidang`, { params })
      .pipe(map((response) => response.bidang ?? []));
  }

  listAll(): Observable<Bidang[]> {
    return collectPages((page) => this.listPage(page));
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
