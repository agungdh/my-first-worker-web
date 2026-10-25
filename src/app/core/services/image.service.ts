import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { defer, EMPTY, expand, firstValueFrom, map, type Observable, reduce } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  Image,
  ImageListResponse,
  ImageResponse,
  PresignResponse,
  PresignedUpload,
  SaveImageInput,
} from '../models/api.models';

const PAGE_SIZE = 20;
const MAX_PAGES = 1000;

@Service()
export class ImageService {
  private readonly http = inject(HttpClient);

  listAll(): Observable<Image[]> {
    const fetchPage = (page: number): Observable<Image[]> =>
      this.listPage(page).pipe(
        expand((images) =>
          page + 1 < MAX_PAGES && images.length === PAGE_SIZE ? fetchPage(page + 1) : EMPTY,
        ),
      );

    return fetchPage(0).pipe(reduce((all, page) => [...all, ...page], [] as Image[]));
  }

  upload(blob: Blob, filename: string): Observable<Image> {
    return defer(async () => {
      const key = await this.putObject(blob);
      return firstValueFrom(this.create({ key, filename }));
    });
  }

  replace(id: number, blob: Blob, filename: string): Observable<Image> {
    return defer(async () => {
      const key = await this.putObject(blob);
      return firstValueFrom(this.update(id, { key, filename }));
    });
  }

  rename(id: number, key: string, filename: string): Observable<Image> {
    return this.update(id, { key, filename });
  }

  delete(id: number): Observable<Image> {
    return this.http
      .delete<ImageResponse>(`${environment.apiBaseUrl}/images/${id}`)
      .pipe(map((response) => response.image));
  }

  private listPage(page: number): Observable<Image[]> {
    const params = new HttpParams().set('page', page.toString());

    return this.http
      .get<ImageListResponse>(`${environment.apiBaseUrl}/images`, { params })
      .pipe(map((response) => response.images ?? []));
  }

  private create(input: SaveImageInput): Observable<Image> {
    return this.http
      .post<ImageResponse>(`${environment.apiBaseUrl}/images`, input)
      .pipe(map((response) => response.image));
  }

  private update(id: number, input: SaveImageInput): Observable<Image> {
    return this.http
      .put<ImageResponse>(`${environment.apiBaseUrl}/images/${id}`, input)
      .pipe(map((response) => response.image));
  }

  private presign(contentType: string, size: number): Observable<PresignedUpload> {
    return this.http
      .post<PresignResponse>(`${environment.apiBaseUrl}/images/presign`, {
        content_type: contentType,
        size,
      })
      .pipe(map((response) => response.upload));
  }

  private async putObject(blob: Blob): Promise<string> {
    const upload = await firstValueFrom(this.presign(blob.type, blob.size));

    const response = await fetch(upload.upload_url, {
      method: upload.method,
      headers: upload.headers,
      body: blob,
      credentials: 'omit',
    });

    if (!response.ok) {
      throw new Error(
        response.status === 403
          ? 'Storage rejected the upload: the file does not match the signed size or type.'
          : `Upload to storage failed (HTTP ${response.status}).`,
      );
    }

    return upload.key;
  }
}
