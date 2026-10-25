import type { PegawaiFormModel } from '../../../core/validation/form-schemas';
import { buildPegawaiInput } from './pegawai-input';

const baseModel: PegawaiFormModel = {
  nip: ' 198001012000011001 ',
  nama: ' Administrator ',
  role: 'admin',
  status: 'aktif',
  bidang_id: '3',
  pangkat_golongan_id: '12',
  jabatan: '',
  peran: '  ',
  kategori_jabatan: '',
  kategori_kebutuhan_jam_pelatihan: 'auditor',
  password: '',
};

describe('buildPegawaiInput', () => {
  it('trims text, converts ids and normalizes empty optional fields to null', () => {
    expect(buildPegawaiInput(baseModel)).toEqual({
      nip: '198001012000011001',
      nama: 'Administrator',
      role: 'admin',
      status: 'aktif',
      bidang_id: 3,
      pangkat_golongan_id: 12,
      jabatan: null,
      peran: null,
      kategori_jabatan: null,
      kategori_kebutuhan_jam_pelatihan: 'auditor',
    });
  });

  it('omits an empty password so the backend keeps the current one', () => {
    const input = buildPegawaiInput({ ...baseModel, password: '   ' });

    expect('password' in input).toBe(false);
  });

  it('includes a non-empty password', () => {
    const input = buildPegawaiInput({ ...baseModel, password: ' Rahasia123 ' });

    expect(input.password).toBe('Rahasia123');
  });

  it('sends null when pangkat golongan is not selected', () => {
    const input = buildPegawaiInput({ ...baseModel, pangkat_golongan_id: '' });

    expect(input.pangkat_golongan_id).toBeNull();
  });
});
