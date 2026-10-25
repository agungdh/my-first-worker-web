import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { ApiFailure } from '../models/api.models';

export function apiErrorMessages(error: unknown): string[] {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return [`Tidak dapat menghubungi API (${environment.apiBaseUrl}). Periksa koneksi Anda.`];
    }

    const body = error.error as Partial<ApiFailure> | null;
    if (body && Array.isArray(body.errors) && body.errors.length > 0) {
      return body.errors.map((entry) => entry.message || 'Permintaan gagal.');
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return [error.error];
    }

    return [error.message || 'Permintaan gagal.'];
  }

  return [error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga.'];
}

export function apiErrorMessage(
  error: unknown,
  fallback = 'Terjadi kesalahan. Silakan coba lagi.',
): string {
  return apiErrorMessages(error)[0] ?? fallback;
}
