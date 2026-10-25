import { maxLength, pattern, required, schema, validate } from '@angular/forms/signals';
import {
  BIDANG_MAX_LENGTH,
  GOLONGAN_MAX_LENGTH,
  JENJANG_MAX_LENGTH,
  KATEGORI_JABATAN_OPTIONS,
  KATEGORI_KEBUTUHAN_JAM_PELATIHAN_OPTIONS,
  NAMA_MAX_LENGTH,
  NIP_MAX_LENGTH,
  NIP_PATTERN,
  PANGKAT_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  ROLE_OPTIONS,
  RUANG_MAX_LENGTH,
  STATUS_OPTIONS,
  TEXT_MAX_LENGTH,
} from '../constants/pegawai';
import type {
  KategoriJabatan,
  KategoriKebutuhanJamPelatihan,
  LoginInput,
  Role,
  Status,
} from '../models/api.models';

export interface PegawaiFormModel {
  nip: string;
  nama: string;
  role: Role | '';
  status: Status | '';
  bidang_id: string;
  pangkat_golongan_id: string;
  jabatan: string;
  peran: string;
  kategori_jabatan: KategoriJabatan | '';
  kategori_kebutuhan_jam_pelatihan: KategoriKebutuhanJamPelatihan | '';
  password: string;
}

export interface BidangFormModel {
  bidang: string;
}

export interface PangkatGolonganFormModel {
  jenjang: string;
  pangkat: string;
  golongan: string;
  ruang: string;
}

export const loginSchema = schema<LoginInput>((path) => {
  required(path.nip, { message: 'NIP wajib diisi.' });
  pattern(path.nip, NIP_PATTERN, { message: 'NIP harus 8-20 digit angka.' });
  required(path.password, { message: 'Password wajib diisi.' });
  maxLength(path.password, PASSWORD_MAX_LENGTH, {
    message: `Password maksimal ${PASSWORD_MAX_LENGTH} karakter.`,
  });
});

export const pegawaiFormSchema = schema<PegawaiFormModel>((path) => {
  required(path.nip, { message: 'NIP wajib diisi.' });
  pattern(path.nip, NIP_PATTERN, { message: 'NIP harus 8-20 digit angka.' });
  maxLength(path.nip, NIP_MAX_LENGTH, { message: `NIP maksimal ${NIP_MAX_LENGTH} karakter.` });

  required(path.nama, { message: 'Nama wajib diisi.' });
  maxLength(path.nama, NAMA_MAX_LENGTH, {
    message: `Nama maksimal ${NAMA_MAX_LENGTH} karakter.`,
  });

  required(path.role, { message: 'Role wajib dipilih.' });
  validate(path.role, ({ value }) =>
    value() && !ROLE_OPTIONS.some((option) => option.value === value())
      ? [{ kind: 'role.invalid', message: 'Role tidak dikenal.' }]
      : [],
  );

  required(path.status, { message: 'Status wajib dipilih.' });
  validate(path.status, ({ value }) =>
    value() && !STATUS_OPTIONS.some((option) => option.value === value())
      ? [{ kind: 'status.invalid', message: 'Status tidak dikenal.' }]
      : [],
  );

  required(path.bidang_id, { message: 'Bidang wajib dipilih.' });

  validate(path.pangkat_golongan_id, ({ value }) =>
    value() && !isPositiveInteger(value())
      ? [{ kind: 'pangkat.invalid', message: 'Pangkat golongan tidak valid.' }]
      : [],
  );

  maxLength(path.jabatan, TEXT_MAX_LENGTH, {
    message: `Jabatan maksimal ${TEXT_MAX_LENGTH} karakter.`,
  });
  maxLength(path.peran, TEXT_MAX_LENGTH, {
    message: `Peran maksimal ${TEXT_MAX_LENGTH} karakter.`,
  });

  validate(path.kategori_jabatan, ({ value }) =>
    value() && !KATEGORI_JABATAN_OPTIONS.some((option) => option.value === value())
      ? [{ kind: 'kategoriJabatan.invalid', message: 'Kategori jabatan tidak dikenal.' }]
      : [],
  );

  validate(path.kategori_kebutuhan_jam_pelatihan, ({ value }) =>
    value() && !KATEGORI_KEBUTUHAN_JAM_PELATIHAN_OPTIONS.some((option) => option.value === value())
      ? [
          {
            kind: 'kategoriKebutuhan.invalid',
            message: 'Kategori kebutuhan jam pelatihan tidak dikenal.',
          },
        ]
      : [],
  );

  // Empty means "use the NIP" on create and "keep current" on update.
  validate(path.password, ({ value }) => {
    const password = value().trim();

    if (!password) return [];
    if (password.length < PASSWORD_MIN_LENGTH) {
      return [
        {
          kind: 'password.minLength',
          message: `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`,
        },
      ];
    }
    if (password.length > PASSWORD_MAX_LENGTH) {
      return [
        {
          kind: 'password.maxLength',
          message: `Password maksimal ${PASSWORD_MAX_LENGTH} karakter.`,
        },
      ];
    }

    return [];
  });
});

export const bidangFormSchema = schema<BidangFormModel>((path) => {
  required(path.bidang, { message: 'Nama bidang wajib diisi.' });
  maxLength(path.bidang, BIDANG_MAX_LENGTH, {
    message: `Nama bidang maksimal ${BIDANG_MAX_LENGTH} karakter.`,
  });
});

export const pangkatGolonganFormSchema = schema<PangkatGolonganFormModel>((path) => {
  required(path.jenjang, { message: 'Jenjang wajib diisi.' });
  maxLength(path.jenjang, JENJANG_MAX_LENGTH, {
    message: `Jenjang maksimal ${JENJANG_MAX_LENGTH} karakter.`,
  });

  required(path.pangkat, { message: 'Pangkat wajib diisi.' });
  maxLength(path.pangkat, PANGKAT_MAX_LENGTH, {
    message: `Pangkat maksimal ${PANGKAT_MAX_LENGTH} karakter.`,
  });

  required(path.golongan, { message: 'Golongan wajib diisi.' });
  maxLength(path.golongan, GOLONGAN_MAX_LENGTH, {
    message: `Golongan maksimal ${GOLONGAN_MAX_LENGTH} karakter.`,
  });

  required(path.ruang, { message: 'Ruang wajib diisi.' });
  maxLength(path.ruang, RUANG_MAX_LENGTH, {
    message: `Ruang maksimal ${RUANG_MAX_LENGTH} karakter.`,
  });
});

function isPositiveInteger(value: string): boolean {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0;
}
