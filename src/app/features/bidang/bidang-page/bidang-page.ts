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
import type { Bidang, SortOrder } from '../../../core/models/api.models';
import {
  BidangService,
  type BidangQuery,
  type BidangSort,
} from '../../../core/services/bidang.service';
import type { Cursor } from '../../../core/util/pagination';
import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog';
import { InfiniteScrollDirective } from '../../../shared/infinite-scroll/infinite-scroll';
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
  imports: [
    InfiniteScrollDirective,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
  ],
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
  readonly loadingMore = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly loadMoreError = signal<string | null>(null);
  readonly nextCursor = signal<Cursor | null>(null);
  readonly hasMore = computed(() => this.nextCursor() !== null);
  readonly canLoadMore = computed(
    () => this.hasMore() && !this.loading() && !this.loadingMore() && this.loadMoreError() === null,
  );

  readonly sort = signal<{ active: BidangSort; direction: SortOrder }>({
    active: 'bidang',
    direction: 'asc',
  });

  readonly columns = ['bidang', 'actions'];

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

    this.sort.set({ active: event.active as BidangSort, direction: event.direction });
    this.reload();
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
              this.rows.update((rows) => rows.filter((item) => item.id !== row.id));
              if (this.rows().length === 0 && this.hasMore()) this.loadMore();
            },
            error: (error: unknown) => {
              this.snackBar.open(apiErrorMessage(error, 'Gagal menghapus bidang.'), 'Tutup', {
                duration: 5000,
              });
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

    const label = reset ? 'Gagal memuat data bidang.' : 'Gagal memuat data berikutnya.';

    this.bidangService
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

  private query(): BidangQuery {
    const cursor = this.nextCursor();

    return {
      ...(cursor ? { cursor: cursor.id, cursorValue: cursor.value } : {}),
      sort: this.sort().active,
      order: this.sort().direction,
    };
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
        this.reload();
      });
  }
}
