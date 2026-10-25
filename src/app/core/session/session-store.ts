import { computed, Service, signal } from '@angular/core';
import type { BidangRef, PangkatGolonganRef, Pegawai, Role, Status } from '../models/api.models';

const STORAGE_KEY = 'mfw.admin.session.v3';
const ROLES: readonly Role[] = ['admin', 'pegawai'];
const STATUSES: readonly Status[] = ['aktif', 'non_aktif'];

/**
 * The credential is the HttpOnly auth cookie: the backend resolves the
 * principal from the JWT `sub` on every request. This store only caches the
 * full pegawai returned by login, so the shell renders without another fetch.
 */
@Service()
export class SessionStore {
  private readonly state = signal<Pegawai | null>(readSession());

  readonly user = this.state.asReadonly();
  readonly isAuthenticated = computed(() => this.state() !== null);
  readonly isAdmin = computed(() => this.state()?.role === 'admin');

  set(user: Pegawai): void {
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

function readSession(): Pegawai | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    return parseUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Discards cached data from older releases or a tampered storage entry. */
function parseUser(value: unknown): Pegawai | null {
  if (!value || typeof value !== 'object') return null;

  const user = value as Partial<Pegawai>;
  if (
    typeof user.id !== 'number' ||
    typeof user.nip !== 'string' ||
    typeof user.nama !== 'string' ||
    !ROLES.includes(user.role as Role) ||
    !STATUSES.includes(user.status as Status) ||
    !isBidangRef(user.bidang) ||
    (user.pangkat_golongan != null && !isPangkatGolonganRef(user.pangkat_golongan))
  ) {
    return null;
  }

  return {
    id: user.id,
    nip: user.nip,
    nama: user.nama,
    role: user.role as Role,
    status: user.status as Status,
    jabatan: typeof user.jabatan === 'string' ? user.jabatan : null,
    peran: typeof user.peran === 'string' ? user.peran : null,
    kategori_jabatan: (user.kategori_jabatan ?? null) as Pegawai['kategori_jabatan'],
    kategori_kebutuhan_jam_pelatihan: (user.kategori_kebutuhan_jam_pelatihan ??
      null) as Pegawai['kategori_kebutuhan_jam_pelatihan'],
    bidang: user.bidang,
    pangkat_golongan: user.pangkat_golongan ?? null,
  };
}

function isBidangRef(value: unknown): value is BidangRef {
  if (!value || typeof value !== 'object') return false;

  const ref = value as Partial<BidangRef>;

  return typeof ref.id === 'number' && typeof ref.bidang === 'string';
}

function isPangkatGolonganRef(value: unknown): value is PangkatGolonganRef {
  if (!value || typeof value !== 'object') return false;

  const ref = value as Partial<PangkatGolonganRef>;

  return (
    typeof ref.id === 'number' &&
    typeof ref.jenjang === 'string' &&
    typeof ref.pangkat === 'string' &&
    typeof ref.golongan === 'string' &&
    typeof ref.ruang === 'string'
  );
}
