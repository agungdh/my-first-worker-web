import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, type MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule, type Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { apiErrorMessage } from '../../../core/http/api-error';
import type { PangkatGolongan, SortOrder } from '../../../core/models/api.models';
import {
  PangkatGolonganService,
  type PangkatGolonganQuery,
  type PangkatGolonganSort,
} from '../../../core/services/pangkat-golongan.service';
import type { Cursor } from '../../../core/util/pagination';
import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog';
import { InfiniteScrollDirective } from '../../../shared/infinite-scroll/infinite-scroll';
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
  imports: [
    InfiniteScrollDirective,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
  ],
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
  readonly loadingMore = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly loadMoreError = signal<string | null>(null);
  readonly nextCursor = signal<Cursor | null>(null);
  readonly hasMore = computed(() => this.nextCursor() !== null);
  readonly canLoadMore = computed(
    () => this.hasMore() && !this.loading() && !this.loadingMore() && this.loadMoreError() === null,
  );

  readonly sort = signal<{ active: PangkatGolonganSort; direction: SortOrder }>({
    active: 'golongan',
    direction: 'asc',
  });

  readonly columns = ['jenjang', 'pangkat', 'golongan', 'ruang', 'actions'];

  private requestId = 0;

  constructor() {
    this.reload();
  }

  reload(): void {
    this.nextCursor.set(null);
    this.rows.set([]);
    this.loadMoreError.set(null);
    this.fetchPage(true);
  }

  loadMore(): void {
    if (!this.canLoadMore()) return;

    this.fetchPage(false);
  }

  retryLoadMore(): void {
    this.loadMoreError.set(null);
    this.loadMore();
  }

  onSortChange(event: Sort): void {
    if (!event.active || !event.direction) return;

    this.sort.set({ active: event.active as PangkatGolonganSort, direction: event.direction });
    this.reload();
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
              this.rows.update((rows) => rows.filter((item) => item.id !== row.id));
              if (this.rows().length === 0 && this.hasMore()) this.loadMore();
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

  private fetchPage(reset: boolean): void {
    const requestId = ++this.requestId;

    if (reset) {
      this.loading.set(true);
      this.loadError.set(null);
    } else {
      this.loadingMore.set(true);
      this.loadMoreError.set(null);
    }

    const label = reset ? 'Gagal memuat data pangkat & golongan.' : 'Gagal memuat data berikutnya.';

    this.service
      .listPage(this.query())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          if (requestId !== this.requestId) return;

          this.rows.update((rows) => (reset ? page.items : [...rows, ...page.items]));
          this.nextCursor.set(
            page.hasMore && page.nextCursor !== null
              ? { id: page.nextCursor, value: page.nextCursorValue }
              : null,
          );
          this.loading.set(false);
          this.loadingMore.set(false);
        },
        error: (error: unknown) => {
          if (requestId !== this.requestId) return;

          if (reset) {
            this.rows.set([]);
            this.nextCursor.set(null);
            this.loading.set(false);
            this.loadError.set(apiErrorMessage(error, label));
            return;
          }

          this.loadingMore.set(false);
          this.loadMoreError.set(apiErrorMessage(error, label));
        },
      });
  }

  private query(): PangkatGolonganQuery {
    const cursor = this.nextCursor();

    return {
      ...(cursor ? { cursor: cursor.id, cursorValue: cursor.value } : {}),
      sort: this.sort().active,
      order: this.sort().direction,
    };
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
        this.reload();
      });
  }
}
