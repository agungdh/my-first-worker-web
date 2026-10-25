import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  KategoriJabatan,
  KategoriKebutuhanJamPelatihan,
  Page,
  Pegawai,
  PegawaiInput,
  PegawaiListResponse,
  PegawaiResponse,
  Role,
  SortOrder,
  Status,
  SuccessResponse,
} from '../models/api.models';

export type PegawaiSort = 'id' | 'nama' | 'nip';

export interface PegawaiQuery {
  cursor?: number;
  cursorValue?: string | null;
  sort: PegawaiSort;
  order: SortOrder;
  search?: string;
  role?: Role;
  status?: Status;
  bidangId?: number;
  pangkatGolonganId?: number;
  kategoriJabatan?: KategoriJabatan;
  kategoriKebutuhanJamPelatihan?: KategoriKebutuhanJamPelatihan;
}

@Service()
export class PegawaiService {
  private readonly http = inject(HttpClient);

  listPage(query: PegawaiQuery): Observable<Page<Pegawai>> {
    let params = new HttpParams().set('sort', query.sort).set('order', query.order);
    if (query.cursor !== undefined) params = params.set('cursor', query.cursor.toString());
    if (query.cursorValue != null) params = params.set('cursor_value', query.cursorValue);

    if (query.search) params = params.set('search', query.search);
    if (query.role) params = params.set('role', query.role);
    if (query.status) params = params.set('status', query.status);
    if (query.bidangId !== undefined) params = params.set('bidang_id', query.bidangId.toString());
    if (query.pangkatGolonganId !== undefined) {
      params = params.set('pangkat_golongan_id', query.pangkatGolonganId.toString());
    }
    if (query.kategoriJabatan) params = params.set('kategori_jabatan', query.kategoriJabatan);
    if (query.kategoriKebutuhanJamPelatihan) {
      params = params.set('kategori_kebutuhan_jam_pelatihan', query.kategoriKebutuhanJamPelatihan);
    }

    return this.http.get<PegawaiListResponse>(`${environment.apiBaseUrl}/pegawai`, { params }).pipe(
      map((response) => ({
        items: response.pegawai ?? [],
        nextCursor: response.next_cursor,
        nextCursorValue: response.next_cursor_value,
        hasMore: response.has_more,
      })),
    );
  }

  get(id: number): Observable<Pegawai> {
    return this.http
      .get<PegawaiResponse>(`${environment.apiBaseUrl}/pegawai/${id}`)
      .pipe(map((response) => response.pegawai));
  }

  create(input: PegawaiInput): Observable<void> {
    return this.http
      .post<SuccessResponse>(`${environment.apiBaseUrl}/pegawai`, input)
      .pipe(map(() => undefined));
  }

  update(id: number, input: PegawaiInput): Observable<void> {
    return this.http
      .put<SuccessResponse>(`${environment.apiBaseUrl}/pegawai/${id}`, input)
      .pipe(map(() => undefined));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<SuccessResponse>(`${environment.apiBaseUrl}/pegawai/${id}`)
      .pipe(map(() => undefined));
  }
}
