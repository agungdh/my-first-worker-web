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
import type { Bidang } from '../../../core/models/api.models';
import { BidangService } from '../../../core/services/bidang.service';
import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog';
import {
  BidangFormDialog,
  type BidangFormDialogData,
} from '../bidang-form-dialog/bidang-form-dialog';

const dialogConfig: MatDialogConfig = {
  width: '480px',
  maxWidth: '94vw',
};

@Component({
  selector: 'app-bidang-page',
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule],
  templateUrl: './bidang-page.html',
  styleUrl: './bidang-page.scss',
})
export class BidangPage {
  private readonly bidangService = inject(BidangService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = signal<Bidang[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly page = signal(0);
  readonly hasNext = computed(() => this.rows().length === PAGE_SIZE);
  readonly columns = ['bidang', 'actions'];

  private requestId = 0;

  constructor() {
    this.load();
  }

  load(): void {
    const requestId = ++this.requestId;
    this.loading.set(true);
    this.loadError.set(null);

    this.bidangService
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
          this.loadError.set(apiErrorMessage(error, 'Gagal memuat data bidang.'));
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

  openEdit(row: Bidang): void {
    this.openFormDialog(row);
  }

  remove(row: Bidang): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Hapus bidang',
        message: `Hapus bidang "${row.bidang}"? Bidang yang masih dipakai pegawai tidak dapat dihapus.`,
        confirmLabel: 'Hapus',
      },
      width: '440px',
      maxWidth: '92vw',
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.bidangService
          .delete(row.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.snackBar.open('Bidang dihapus.', 'Tutup', { duration: 3000 });
              if (this.rows().length === 1 && this.page() > 0) {
                this.page.update((page) => page - 1);
              }
              this.load();
            },
            error: (error: unknown) => {
              this.snackBar.open(apiErrorMessage(error, 'Gagal menghapus bidang.'), 'Tutup', {
                duration: 5000,
              });
            },
          });
      });
  }

  private openFormDialog(bidang?: Bidang): void {
    const ref = this.dialog.open<BidangFormDialog, BidangFormDialogData, boolean>(
      BidangFormDialog,
      {
        ...dialogConfig,
        data: { bidang },
        autoFocus: 'first-tabbable',
      },
    );

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved) => {
        if (!saved) return;

        this.snackBar.open(bidang ? 'Bidang diperbarui.' : 'Bidang baru ditambahkan.', 'Tutup', {
          duration: 3000,
        });
        if (!bidang) this.page.set(0);
        this.load();
      });
  }
}
