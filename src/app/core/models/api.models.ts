export type Role = 'admin' | 'pegawai';
export type Status = 'aktif' | 'non_aktif';
export type KategoriJabatan = 'struktural' | 'fungsional auditor' | 'fungsional tertentu';
export type KategoriKebutuhanJamPelatihan = 'admin' | 'pejabat' | 'auditor';

/** Identity returned by `POST /api/auth/login`; the token itself lives in an HttpOnly cookie. */
export interface ApiUser {
  id: number;
  nip: string;
  nama: string;
  role: Role;
}

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

export interface AuthResponse {
  success: boolean;
  user: ApiUser;
}

export interface PegawaiListResponse {
  success: boolean;
  pegawai: Pegawai[];
}

export interface PegawaiResponse {
  success: boolean;
  pegawai: Pegawai;
}

export interface BidangListResponse {
  success: boolean;
  bidang: Bidang[];
}

export interface BidangResponse {
  success: boolean;
  bidang: Bidang;
}

export interface PangkatGolonganListResponse {
  success: boolean;
  pangkat_golongan: PangkatGolongan[];
}

export interface PangkatGolonganResponse {
  success: boolean;
  pangkat_golongan: PangkatGolongan;
}
