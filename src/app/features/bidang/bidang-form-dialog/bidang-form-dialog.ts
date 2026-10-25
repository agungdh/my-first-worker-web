import { Component, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { apiErrorMessage } from '../../../core/http/api-error';
import type { Bidang } from '../../../core/models/api.models';
import { BidangService } from '../../../core/services/bidang.service';
import { bidangFormSchema, type BidangFormModel } from '../../../core/validation/form-schemas';

export interface BidangFormDialogData {
  bidang?: Bidang;
}

@Component({
  selector: 'app-bidang-form-dialog',
  imports: [
    FormField,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './bidang-form-dialog.html',
  styleUrl: './bidang-form-dialog.scss',
})
export class BidangFormDialog {
  readonly data = inject<BidangFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<BidangFormDialog, boolean>);
  private readonly bidangService = inject(BidangService);

  readonly isEdit = !!this.data.bidang;
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private readonly model = signal<BidangFormModel>({
    bidang: this.data.bidang?.bidang ?? '',
  });

  readonly form = form(this.model, bidangFormSchema);

  save(event: Event): void {
    event.preventDefault();

    if (this.saving()) return;

    const formState = this.form();
    if (formState.invalid()) {
      formState.markAsTouched();
      return;
    }

    const input = { bidang: formState.value().bidang.trim() };

    this.saving.set(true);
    this.errorMessage.set(null);

    const request = this.data.bidang
      ? this.bidangService.update(this.data.bidang.id, input)
      : this.bidangService.create(input);

    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: (error: unknown) =>
        this.fail(error, this.isEdit ? 'Gagal memperbarui bidang.' : 'Gagal menambahkan bidang.'),
    });
  }

  private fail(error: unknown, fallback: string): void {
    this.saving.set(false);
    this.errorMessage.set(apiErrorMessage(error, fallback));
  }
}
