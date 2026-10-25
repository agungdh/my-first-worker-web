import { Component, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  KATEGORI_JABATAN_OPTIONS,
  KATEGORI_KEBUTUHAN_JAM_PELATIHAN_OPTIONS,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
} from '../../../core/constants/pegawai';
import { apiErrorMessage } from '../../../core/http/api-error';
import type { Bidang, PangkatGolongan, Pegawai } from '../../../core/models/api.models';
import { PegawaiService } from '../../../core/services/pegawai.service';
import { pegawaiFormSchema, type PegawaiFormModel } from '../../../core/validation/form-schemas';
import { buildPegawaiInput } from './pegawai-input';

export interface PegawaiFormDialogData {
  pegawai?: Pegawai;
  bidangOptions: Bidang[];
  pangkatOptions: PangkatGolongan[];
}

@Component({
  selector: 'app-pegawai-form-dialog',
  imports: [
    FormField,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './pegawai-form-dialog.html',
  styleUrl: './pegawai-form-dialog.scss',
})
export class PegawaiFormDialog {
  readonly data = inject<PegawaiFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PegawaiFormDialog, boolean>);
  private readonly pegawaiService = inject(PegawaiService);

  readonly roleOptions = ROLE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;
  readonly kategoriJabatanOptions = KATEGORI_JABATAN_OPTIONS;
  readonly kategoriKebutuhanOptions = KATEGORI_KEBUTUHAN_JAM_PELATIHAN_OPTIONS;

  readonly isEdit = !!this.data.pegawai;
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  private readonly model = signal<PegawaiFormModel>({
    nip: this.data.pegawai?.nip ?? '',
    nama: this.data.pegawai?.nama ?? '',
    role: this.data.pegawai?.role ?? 'pegawai',
    status: this.data.pegawai?.status ?? 'aktif',
    bidang_id: this.data.pegawai ? String(this.data.pegawai.bidang.id) : '',
    pangkat_golongan_id: this.data.pegawai?.pangkat_golongan
      ? String(this.data.pegawai.pangkat_golongan.id)
      : '',
    jabatan: this.data.pegawai?.jabatan ?? '',
    peran: this.data.pegawai?.peran ?? '',
    kategori_jabatan: this.data.pegawai?.kategori_jabatan ?? '',
    kategori_kebutuhan_jam_pelatihan: this.data.pegawai?.kategori_kebutuhan_jam_pelatihan ?? '',
    password: '',
  });

  readonly form = form(this.model, pegawaiFormSchema);

  togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  save(event: Event): void {
    event.preventDefault();

    if (this.saving()) return;

    const formState = this.form();
    if (formState.invalid()) {
      formState.markAsTouched();
      return;
    }

    const input = buildPegawaiInput(formState.value());

    this.saving.set(true);
    this.errorMessage.set(null);

    const request = this.data.pegawai
      ? this.pegawaiService.update(this.data.pegawai.id, input)
      : this.pegawaiService.create(input);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (error: unknown) =>
        this.fail(
          error,
          this.isEdit ? 'Gagal memperbarui data pegawai.' : 'Gagal menambahkan pegawai.',
        ),
    });
  }

  private fail(error: unknown, fallback: string): void {
    this.saving.set(false);
    this.errorMessage.set(apiErrorMessage(error, fallback));
  }
}
