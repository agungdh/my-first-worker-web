import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, type Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ApiUser, AuthResponse, LoginInput } from '../models/api.models';
import { SessionStore } from '../session/session-store';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionStore);

  readonly user = this.session.user;
  readonly isAuthenticated = this.session.isAuthenticated;
  readonly isAdmin = this.session.isAdmin;

  login(input: LoginInput): Observable<ApiUser> {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, input).pipe(
      map((response) => response.user),
      tap((user) => this.session.set(user)),
    );
  }

  logout(): Observable<void> {
    return this.http.post<unknown>(`${environment.apiBaseUrl}/auth/logout`, {}).pipe(
      catchError(() => of(null)),
      tap(() => this.session.clear()),
      map(() => undefined),
    );
  }
}
