export type Role = 'admin' | 'pegawai';
export type Status = 'aktif' | 'non_aktif';
export type KategoriJabatan = 'struktural' | 'fungsional auditor' | 'fungsional tertentu';
export type KategoriKebutuhanJamPelatihan = 'admin' | 'pejabat' | 'auditor';
export type SortOrder = 'asc' | 'desc';

export interface Bidang {
  id: number;
  bidang: string;
}

export interface BidangRef {
  id: number;
  bidang: string;
}

export interface PangkatGolongan {
  id: number;
  jenjang: string;
  pangkat: string;
  golongan: string;
  ruang: string;
}

export type PangkatGolonganRef = PangkatGolongan;

export interface Pegawai {
  id: number;
  nip: string;
  nama: string;
  role: Role;
  status: Status;
  jabatan: string | null;
  peran: string | null;
  kategori_jabatan: KategoriJabatan | null;
  kategori_kebutuhan_jam_pelatihan: KategoriKebutuhanJamPelatihan | null;
  bidang: BidangRef;
  pangkat_golongan: PangkatGolonganRef | null;
}

export interface PegawaiInput {
  nip: string;
  nama: string;
  role: Role;
  status: Status;
  bidang_id: number;
  pangkat_golongan_id: number | null;
  jabatan: string | null;
  peran: string | null;
  kategori_jabatan: KategoriJabatan | null;
  kategori_kebutuhan_jam_pelatihan: KategoriKebutuhanJamPelatihan | null;
  /** Omitted on create means "default to NIP"; omitted on update means "keep current". */
  password?: string;
}

export interface BidangInput {
  bidang: string;
}

export interface PangkatGolonganInput {
  jenjang: string;
  pangkat: string;
  golongan: string;
  ruang: string;
}

export interface LoginInput {
  nip: string;
  password: string;
}

export interface ApiError {
  code: number;
  message: string;
  path?: string[];
}

export interface ApiFailure {
  success: false;
  errors: ApiError[];
}

export interface SuccessResponse {
  success: boolean;
}

/**
 * `POST /api/auth/login` returns the full pegawai record (with relations) and
 * sets the HttpOnly cookie. The JWT itself only carries the pegawai id.
 */
export interface AuthResponse {
  success: boolean;
  user: Pegawai;
}

/** Cursor metadata shared by every list endpoint. */
export interface CursorPageMeta {
  next_cursor: number | null;
  next_cursor_value: string | null;
  has_more: boolean;
}

/** Normalized list page used by services and infinite-scroll pages. */
export interface Page<T> {
  items: T[];
  nextCursor: number | null;
  nextCursorValue: string | null;
  hasMore: boolean;
}

export interface PegawaiListResponse extends CursorPageMeta {
  success: boolean;
  pegawai: Pegawai[];
}

export interface PegawaiResponse {
  success: boolean;
  pegawai: Pegawai;
}

export interface BidangListResponse extends CursorPageMeta {
  success: boolean;
  bidang: Bidang[];
}

export interface BidangResponse {
  success: boolean;
  bidang: Bidang;
}

export interface PangkatGolonganListResponse extends CursorPageMeta {
  success: boolean;
  pangkat_golongan: PangkatGolongan[];
}

export interface PangkatGolonganResponse {
  success: boolean;
  pangkat_golongan: PangkatGolongan;
}
