import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  PangkatGolongan,
  PangkatGolonganInput,
  PangkatGolonganListResponse,
  PangkatGolonganResponse,
  SuccessResponse,
} from '../models/api.models';
import { collectPages } from '../util/pagination';

@Service()
export class PangkatGolonganService {
  private readonly http = inject(HttpClient);

  listPage(page: number): Observable<PangkatGolongan[]> {
    const params = new HttpParams().set('page', page.toString());

    return this.http
      .get<PangkatGolonganListResponse>(`${environment.apiBaseUrl}/pangkat-golongan`, { params })
      .pipe(map((response) => response.pangkat_golongan ?? []));
  }

  listAll(): Observable<PangkatGolongan[]> {
    return collectPages((page) => this.listPage(page));
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
