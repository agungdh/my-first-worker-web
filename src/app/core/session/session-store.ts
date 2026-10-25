import { computed, Service, signal } from '@angular/core';
import type { ApiUser, Role } from '../models/api.models';

const STORAGE_KEY = 'mfw.admin.session.v2';
const ROLES: readonly Role[] = ['admin', 'pegawai'];

/**
 * The real credential is the HttpOnly auth cookie. This store only keeps the
 * identity returned at login so the shell can render without a `/me` endpoint.
 */
@Service()
export class SessionStore {
  private readonly state = signal<ApiUser | null>(readSession());

  readonly user = this.state.asReadonly();
  readonly isAuthenticated = computed(() => this.state() !== null);
  readonly isAdmin = computed(() => this.state()?.role === 'admin');

  set(user: ApiUser): void {
    this.state.set(user);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Storage can be unavailable (private mode); the in-memory session still works.
    }
  }

  clear(): void {
    this.state.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
  }
}

function readSession(): ApiUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ApiUser> | null;
    if (
      parsed &&
      typeof parsed.id === 'number' &&
      typeof parsed.nip === 'string' &&
      typeof parsed.nama === 'string' &&
      typeof parsed.role === 'string' &&
      ROLES.includes(parsed.role as Role)
    ) {
      return {
        id: parsed.id,
        nip: parsed.nip,
        nama: parsed.nama,
        role: parsed.role as Role,
      };
    }
  } catch {
    return null;
  }

  return null;
}
