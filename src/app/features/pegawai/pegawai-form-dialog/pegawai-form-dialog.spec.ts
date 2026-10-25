import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import type { Pegawai } from '../../../core/models/api.models';
import { PegawaiService } from '../../../core/services/pegawai.service';
import { PegawaiFormDialog, type PegawaiFormDialogData } from './pegawai-form-dialog';

const bidang = { id: 3, bidang: 'SUBBAGIAN KEPEGAWAIAN' };
const pangkat = {
  id: 5,
  jenjang: 'Penata',
  pangkat: 'Penata Muda',
  golongan: 'III',
  ruang: 'a',
};

const existing: Pegawai = {
  id: 7,
  nip: '199001012015011001',
  nama: 'Budi Santoso',
  role: 'pegawai',
  status: 'aktif',
  jabatan: 'Staf',
  peran: null,
  kategori_jabatan: 'struktural',
  kategori_kebutuhan_jam_pelatihan: null,
  bidang,
  pangkat_golongan: pangkat,
};

const options: PegawaiFormDialogData = {
  bidangOptions: [bidang],
  pangkatOptions: [pangkat],
};

describe('PegawaiFormDialog', () => {
  const service = {
    create: vi.fn(() => of(undefined)),
    update: vi.fn(() => of(undefined)),
  };
  const dialogRef = { close: vi.fn() };

  function setup(data: PegawaiFormDialogData) {
    TestBed.configureTestingModule({
      imports: [PegawaiFormDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: PegawaiService, useValue: service },
      ],
    });

    const fixture = TestBed.createComponent(PegawaiFormDialog);
    fixture.detectChanges();

    return fixture;
  }

  async function submit(fixture: ReturnType<typeof setup>): Promise<void> {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(() => {
    service.create.mockClear();
    service.update.mockClear();
    dialogRef.close.mockClear();
  });

  it('prefills the form and sends a full update payload', async () => {
    const fixture = setup({ ...options, pegawai: existing });
    await fixture.whenStable();

    await submit(fixture);

    expect(service.update).toHaveBeenCalledWith(7, {
      nip: '199001012015011001',
      nama: 'Budi Santoso',
      role: 'pegawai',
      status: 'aktif',
      bidang_id: 3,
      pangkat_golongan_id: 5,
      jabatan: 'Staf',
      peran: null,
      kategori_jabatan: 'struktural',
      kategori_kebutuhan_jam_pelatihan: null,
    });
    expect(service.create).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('creates a pegawai from typed values without a password', async () => {
    const fixture = setup(options);
    await fixture.whenStable();

    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    inputs[0].value = '198505052010011002';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'Siti Aminah';
    inputs[1].dispatchEvent(new Event('input'));

    const selects = fixture.nativeElement.querySelectorAll(
      'select',
    ) as NodeListOf<HTMLSelectElement>;
    // Selects render in order: role, status, bidang, pangkat, kategori jabatan, kebutuhan.
    selects[2].value = '3';
    selects[2].dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await fixture.whenStable();

    await submit(fixture);

    expect(service.create).toHaveBeenCalledWith({
      nip: '198505052010011002',
      nama: 'Siti Aminah',
      role: 'pegawai',
      status: 'aktif',
      bidang_id: 3,
      pangkat_golongan_id: null,
      jabatan: null,
      peran: null,
      kategori_jabatan: null,
      kategori_kebutuhan_jam_pelatihan: null,
    });
    expect(service.update).not.toHaveBeenCalled();
  });

  it('blocks submission when a required field is empty', async () => {
    const fixture = setup(options);
    await fixture.whenStable();

    await submit(fixture);

    expect(service.create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('NIP wajib diisi.');
    expect(fixture.nativeElement.textContent).toContain('Bidang wajib dipilih.');
  });
});
