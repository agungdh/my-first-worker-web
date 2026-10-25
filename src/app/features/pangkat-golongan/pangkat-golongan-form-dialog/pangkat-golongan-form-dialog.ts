import { Component, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { apiErrorMessage } from '../../../core/http/api-error';
import type { PangkatGolongan } from '../../../core/models/api.models';
import { PangkatGolonganService } from '../../../core/services/pangkat-golongan.service';
import {
  pangkatGolonganFormSchema,
  type PangkatGolonganFormModel,
} from '../../../core/validation/form-schemas';

export interface PangkatGolonganFormDialogData {
  pangkat?: PangkatGolongan;
}

@Component({
  selector: 'app-pangkat-golongan-form-dialog',
  imports: [
    FormField,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './pangkat-golongan-form-dialog.html',
  styleUrl: './pangkat-golongan-form-dialog.scss',
})
export class PangkatGolonganFormDialog {
  readonly data = inject<PangkatGolonganFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PangkatGolonganFormDialog, boolean>);
  private readonly service = inject(PangkatGolonganService);

  readonly isEdit = !!this.data.pangkat;
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private readonly model = signal<PangkatGolonganFormModel>({
    jenjang: this.data.pangkat?.jenjang ?? '',
    pangkat: this.data.pangkat?.pangkat ?? '',
    golongan: this.data.pangkat?.golongan ?? '',
    ruang: this.data.pangkat?.ruang ?? '',
  });

  readonly form = form(this.model, pangkatGolonganFormSchema);

  save(event: Event): void {
    event.preventDefault();

    if (this.saving()) return;

    const formState = this.form();
    if (formState.invalid()) {
      formState.markAsTouched();
      return;
    }

    const value = formState.value();
    const input = {
      jenjang: value.jenjang.trim(),
      pangkat: value.pangkat.trim(),
      golongan: value.golongan.trim(),
      ruang: value.ruang.trim(),
    };

    this.saving.set(true);
    this.errorMessage.set(null);

    const request = this.data.pangkat
      ? this.service.update(this.data.pangkat.id, input)
      : this.service.create(input);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (error: unknown) =>
        this.fail(
          error,
          this.isEdit
            ? 'Gagal memperbarui pangkat & golongan.'
            : 'Gagal menambahkan pangkat & golongan.',
        ),
    });
  }

  private fail(error: unknown, fallback: string): void {
    this.saving.set(false);
    this.errorMessage.set(apiErrorMessage(error, fallback));
  }
}
