import type {
  KategoriJabatan,
  KategoriKebutuhanJamPelatihan,
  Role,
  Status,
} from '../models/api.models';

export interface EnumOption<T extends string> {
  value: T;
  label: string;
}

export const ROLE_OPTIONS: readonly EnumOption<Role>[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'pegawai', label: 'Pegawai' },
];

export const STATUS_OPTIONS: readonly EnumOption<Status>[] = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'non_aktif', label: 'Non-aktif' },
];

export const KATEGORI_JABATAN_OPTIONS: readonly EnumOption<KategoriJabatan>[] = [
  { value: 'struktural', label: 'Struktural' },
  { value: 'fungsional auditor', label: 'Fungsional auditor' },
  { value: 'fungsional tertentu', label: 'Fungsional tertentu' },
];

export const KATEGORI_KEBUTUHAN_JAM_PELATIHAN_OPTIONS: readonly EnumOption<KategoriKebutuhanJamPelatihan>[] =
  [
    { value: 'admin', label: 'Admin' },
    { value: 'pejabat', label: 'Pejabat' },
    { value: 'auditor', label: 'Auditor' },
  ];

/** Backend page size (`src/shared/config.ts`); list responses carry no total. */
export const PAGE_SIZE = 20;
export const SEARCH_MIN_LENGTH = 3;
export const NIP_PATTERN = /^\d{8,20}$/;

export const NIP_MAX_LENGTH = 20;
export const NAMA_MAX_LENGTH = 150;
export const TEXT_MAX_LENGTH = 150;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const BIDANG_MAX_LENGTH = 255;
export const JENJANG_MAX_LENGTH = 100;
export const PANGKAT_MAX_LENGTH = 150;
export const GOLONGAN_MAX_LENGTH = 20;
export const RUANG_MAX_LENGTH = 20;

export function roleLabel(role: Role): string {
  return ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;
}

export function statusLabel(status: Status): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function kategoriJabatanLabel(value: KategoriJabatan | null): string {
  if (!value) return '—';

  return KATEGORI_JABATAN_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function kategoriKebutuhanLabel(value: KategoriKebutuhanJamPelatihan | null): string {
  if (!value) return '—';

  return (
    KATEGORI_KEBUTUHAN_JAM_PELATIHAN_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export function pangkatLabel(
  pangkat: { jenjang: string; pangkat: string; golongan: string; ruang: string } | null,
): string {
  if (!pangkat) return '—';

  return `${pangkat.pangkat} (${pangkat.golongan}/${pangkat.ruang})`;
}
