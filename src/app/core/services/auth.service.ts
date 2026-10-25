import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, type Observable, of, tap } from 'rxjs';
import type { AuthResponse, LoginInput, RegisterInput, User } from '../models/api.models';
import { SessionStore } from '../session/session-store';
import { API_BASE_URL } from '../config/api.config';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionStore);

  readonly user = this.session.user;
  readonly isAuthenticated = this.session.isAuthenticated;

  login(input: LoginInput): Observable<User> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, input).pipe(
      map((response) => response.user),
      tap((user) => this.session.set(user)),
    );
  }

  register(input: RegisterInput): Observable<User> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/register`, input).pipe(
      map((response) => response.user),
      tap((user) => this.session.set(user)),
    );
  }

  logout(): Observable<void> {
    return this.http.post<unknown>(`${API_BASE_URL}/auth/logout`, {}).pipe(
      catchError(() => of(null)),
      tap(() => this.session.clear()),
      map(() => undefined),
    );
  }
}
