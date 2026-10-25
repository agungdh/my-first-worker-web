import type {
  KategoriJabatan,
  KategoriKebutuhanJamPelatihan,
  PegawaiInput,
  Role,
  Status,
} from '../../../core/models/api.models';
import type { PegawaiFormModel } from '../../../core/validation/form-schemas';

/**
 * Turns the signal-forms model (selects are strings) into the strict snake_case
 * payload the API expects. Empty optional text becomes `null`, and an empty
 * password is omitted so the backend keeps the current one / defaults to NIP.
 */
export function buildPegawaiInput(value: PegawaiFormModel): PegawaiInput {
  const password = value.password.trim();

  return {
    nip: value.nip.trim(),
    nama: value.nama.trim(),
    role: value.role as Role,
    status: value.status as Status,
    bidang_id: Number(value.bidang_id),
    pangkat_golongan_id: value.pangkat_golongan_id ? Number(value.pangkat_golongan_id) : null,
    jabatan: value.jabatan.trim() || null,
    peran: value.peran.trim() || null,
    kategori_jabatan: (value.kategori_jabatan || null) as KategoriJabatan | null,
    kategori_kebutuhan_jam_pelatihan: (value.kategori_kebutuhan_jam_pelatihan ||
      null) as KategoriKebutuhanJamPelatihan | null,
    ...(password ? { password } : {}),
  };
}
