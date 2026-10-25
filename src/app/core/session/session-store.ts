import { computed, Service, signal } from '@angular/core';
import type { User } from '../models/api.models';

const STORAGE_KEY = 'mfw.admin.session';

@Service()
export class SessionStore {
  private readonly state = signal<User | null>(readSession());

  readonly user = this.state.asReadonly();
  readonly isAuthenticated = computed(() => this.state() !== null);

  set(user: User): void {
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

function readSession(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<User> | null;
    if (
      parsed &&
      typeof parsed.id === 'number' &&
      typeof parsed.username === 'string' &&
      typeof parsed.name === 'string'
    ) {
      return { id: parsed.id, username: parsed.username, name: parsed.name };
    }
  } catch {
    return null;
  }

  return null;
}
