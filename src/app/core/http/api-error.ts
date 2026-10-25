import { HttpErrorResponse } from '@angular/common/http';
import type { ApiFailure } from '../models/api.models';

export function apiErrorMessages(error: unknown): string[] {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return ['Cannot reach the API. Make sure the backend is running on http://localhost:8787.'];
    }

    const body = error.error as Partial<ApiFailure> | null;
    if (body && Array.isArray(body.errors) && body.errors.length > 0) {
      return body.errors.map((entry) => entry.message || 'Request failed');
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return [error.error];
    }

    return [error.message || 'Request failed'];
  }

  return [error instanceof Error ? error.message : 'Unexpected error'];
}

export function apiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  return apiErrorMessages(error)[0] ?? fallback;
}
