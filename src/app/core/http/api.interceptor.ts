import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionStore } from '../session/session-store';

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionStore);
  const router = inject(Router);

  return next(request.clone({ withCredentials: true })).pipe(
    catchError((error: unknown) => {
      const isAuthRequest = request.url.startsWith(`${environment.apiBaseUrl}/auth/`);

      if (error instanceof HttpErrorResponse && !isAuthRequest) {
        if (error.status === 401) {
          session.clear();
          void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        } else if (error.status === 403) {
          // The cached role can be stale; the backend is the source of truth.
          void router.navigate(['/akses-ditolak']);
        }
      }

      return throwError(() => error);
    }),
  );
};
