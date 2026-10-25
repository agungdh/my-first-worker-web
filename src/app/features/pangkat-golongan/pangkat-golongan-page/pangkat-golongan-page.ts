import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, type MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { PAGE_SIZE } from '../../../core/constants/pegawai';
import { apiErrorMessage } from '../../../core/http/api-error';
import type { PangkatGolongan } from '../../../core/models/api.models';
import { PangkatGolonganService } from '../../../core/services/pangkat-golongan.service';
import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog';
import {
  PangkatGolonganFormDialog,
  type PangkatGolonganFormDialogData,
} from '../pangkat-golongan-form-dialog/pangkat-golongan-form-dialog';

const dialogConfig: MatDialogConfig = {
  width: '560px',
  maxWidth: '94vw',
};

@Component({
  selector: 'app-pangkat-golongan-page',
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule],
  templateUrl: './pangkat-golongan-page.html',
  styleUrl: './pangkat-golongan-page.scss',
})
export class PangkatGolonganPage {
  private readonly service = inject(PangkatGolonganService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = signal<PangkatGolongan[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly page = signal(0);
  readonly hasNext = computed(() => this.rows().length === PAGE_SIZE);
  readonly columns = ['jenjang', 'pangkat', 'golongan', 'ruang', 'actions'];

  private requestId = 0;

  constructor() {
    this.load();
  }

  load(): void {
    const requestId = ++this.requestId;
    this.loading.set(true);
    this.loadError.set(null);

    this.service
      .listPage(this.page())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          if (requestId !== this.requestId) return;

          this.rows.set(rows);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          if (requestId !== this.requestId) return;

          this.rows.set([]);
          this.loadError.set(apiErrorMessage(error, 'Gagal memuat data pangkat & golongan.'));
          this.loading.set(false);
        },
      });
  }

  previousPage(): void {
    if (this.page() === 0) return;

    this.page.update((page) => page - 1);
    this.load();
  }

  nextPage(): void {
    if (!this.hasNext()) return;

    this.page.update((page) => page + 1);
    this.load();
  }

  openCreate(): void {
    this.openFormDialog();
  }

  openEdit(row: PangkatGolongan): void {
    this.openFormDialog(row);
  }

  remove(row: PangkatGolongan): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Hapus pangkat & golongan',
        message: `Hapus "${row.pangkat} (${row.golongan}/${row.ruang})"? Data yang masih dipakai pegawai tidak dapat dihapus.`,
        confirmLabel: 'Hapus',
      },
      width: '460px',
      maxWidth: '92vw',
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.service
          .delete(row.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.snackBar.open('Pangkat & golongan dihapus.', 'Tutup', { duration: 3000 });
              if (this.rows().length === 1 && this.page() > 0) {
                this.page.update((page) => page - 1);
              }
              this.load();
            },
            error: (error: unknown) => {
              this.snackBar.open(
                apiErrorMessage(error, 'Gagal menghapus pangkat & golongan.'),
                'Tutup',
                { duration: 5000 },
              );
            },
          });
      });
  }

  private openFormDialog(pangkat?: PangkatGolongan): void {
    const ref = this.dialog.open<PangkatGolonganFormDialog, PangkatGolonganFormDialogData, boolean>(
      PangkatGolonganFormDialog,
      {
        ...dialogConfig,
        data: { pangkat },
        autoFocus: 'first-tabbable',
      },
    );

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved) => {
        if (!saved) return;

        this.snackBar.open(
          pangkat ? 'Pangkat & golongan diperbarui.' : 'Pangkat & golongan ditambahkan.',
          'Tutup',
          { duration: 3000 },
        );
        if (!pangkat) this.page.set(0);
        this.load();
      });
  }
}
