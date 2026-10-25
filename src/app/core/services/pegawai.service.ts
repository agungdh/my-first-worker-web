import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  KategoriJabatan,
  KategoriKebutuhanJamPelatihan,
  Pegawai,
  PegawaiInput,
  PegawaiListResponse,
  PegawaiResponse,
  Role,
  Status,
  SuccessResponse,
} from '../models/api.models';

export interface PegawaiQuery {
  page: number;
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

  listPage(query: PegawaiQuery): Observable<Pegawai[]> {
    let params = new HttpParams().set('page', query.page.toString());

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

    return this.http
      .get<PegawaiListResponse>(`${environment.apiBaseUrl}/pegawai`, { params })
      .pipe(map((response) => response.pegawai ?? []));
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
