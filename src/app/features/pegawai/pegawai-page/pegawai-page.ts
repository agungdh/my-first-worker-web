import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, type MatDialogConfig } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule, type Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, of, Subject } from 'rxjs';
import {
  KATEGORI_JABATAN_OPTIONS,
  KATEGORI_KEBUTUHAN_JAM_PELATIHAN_OPTIONS,
  ROLE_OPTIONS,
  SEARCH_MIN_LENGTH,
  STATUS_OPTIONS,
  pangkatLabel,
  roleLabel,
  statusLabel,
} from '../../../core/constants/pegawai';
import { apiErrorMessage } from '../../../core/http/api-error';
import type {
  Bidang,
  KategoriJabatan,
  KategoriKebutuhanJamPelatihan,
  PangkatGolongan,
  Pegawai,
  Role,
  SortOrder,
  Status,
} from '../../../core/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { BidangService } from '../../../core/services/bidang.service';
import { PangkatGolonganService } from '../../../core/services/pangkat-golongan.service';
import {
  PegawaiService,
  type PegawaiQuery,
  type PegawaiSort,
} from '../../../core/services/pegawai.service';
import type { Cursor } from '../../../core/util/pagination';
import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog';
import { InfiniteScrollDirective } from '../../../shared/infinite-scroll/infinite-scroll';
import {
  PegawaiFormDialog,
  type PegawaiFormDialogData,
} from '../pegawai-form-dialog/pegawai-form-dialog';

const dialogConfig: MatDialogConfig = {
  width: '760px',
  maxWidth: '96vw',
};

@Component({
  selector: 'app-pegawai-page',
  imports: [
    InfiniteScrollDirective,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
  ],
  templateUrl: './pegawai-page.html',
  styleUrl: './pegawai-page.scss',
})
export class PegawaiPage {
  private readonly pegawaiService = inject(PegawaiService);
  private readonly bidangService = inject(BidangService);
  private readonly pangkatService = inject(PangkatGolonganService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly roleOptions = ROLE_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;
  readonly kategoriJabatanOptions = KATEGORI_JABATAN_OPTIONS;
  readonly kategoriKebutuhanOptions = KATEGORI_KEBUTUHAN_JAM_PELATIHAN_OPTIONS;
  readonly searchMinLength = SEARCH_MIN_LENGTH;

  readonly rows = signal<Pegawai[]>([]);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly loadMoreError = signal<string | null>(null);
  readonly nextCursor = signal<Cursor | null>(null);
  readonly hasMore = computed(() => this.nextCursor() !== null);
  readonly canLoadMore = computed(
    () => this.hasMore() && !this.loading() && !this.loadingMore() && this.loadMoreError() === null,
  );

  readonly sort = signal<{ active: PegawaiSort; direction: SortOrder }>({
    active: 'nama',
    direction: 'asc',
  });

  readonly bidangOptions = signal<Bidang[]>([]);
  readonly pangkatOptions = signal<PangkatGolongan[]>([]);

  readonly search = signal('');
  readonly roleFilter = signal<Role | ''>('');
  readonly statusFilter = signal<Status | ''>('');
  readonly bidangFilter = signal<number | ''>('');
  readonly pangkatFilter = signal<number | ''>('');
  readonly kategoriJabatanFilter = signal<KategoriJabatan | ''>('');
  readonly kategoriKebutuhanFilter = signal<KategoriKebutuhanJamPelatihan | ''>('');

  readonly columns = ['nama', 'nip', 'bidang', 'pangkat', 'jabatan', 'role', 'status', 'actions'];

  readonly searchTooShort = computed(() => {
    const term = this.search().trim();
    return term.length > 0 && term.length < SEARCH_MIN_LENGTH;
  });

  private readonly searchInput = new Subject<string>();
  private requestId = 0;

  constructor() {
    this.searchInput
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (value === this.search()) return;

        this.search.set(value);
        this.reload();
      });

    this.loadLookups();
    this.reload();
  }

  reload(): void {
    this.nextCursor.set(null);
    this.rows.set([]);
    this.loadMoreError.set(null);

    if (this.searchTooShort()) {
      this.requestId += 1;
      this.loading.set(false);
      this.loadError.set(null);
      return;
    }

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

  onSearch(event: Event): void {
    this.searchInput.next((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchInput.next('');
    this.search.set('');
    this.reload();
  }

  onSortChange(event: Sort): void {
    if (!event.active || !event.direction) return;

    this.sort.set({ active: event.active as PegawaiSort, direction: event.direction });
    this.reload();
  }

  onRoleChange(value: Role | ''): void {
    this.roleFilter.set(value);
    this.reload();
  }

  onStatusChange(value: Status | ''): void {
    this.statusFilter.set(value);
    this.reload();
  }

  onBidangChange(value: number | ''): void {
    this.bidangFilter.set(value);
    this.reload();
  }

  onPangkatChange(value: number | ''): void {
    this.pangkatFilter.set(value);
    this.reload();
  }

  onKategoriJabatanChange(value: KategoriJabatan | ''): void {
    this.kategoriJabatanFilter.set(value);
    this.reload();
  }

  onKategoriKebutuhanChange(value: KategoriKebutuhanJamPelatihan | ''): void {
    this.kategoriKebutuhanFilter.set(value);
    this.reload();
  }

  resetFilters(): void {
    this.searchInput.next('');
    this.search.set('');
    this.roleFilter.set('');
    this.statusFilter.set('');
    this.bidangFilter.set('');
    this.pangkatFilter.set('');
    this.kategoriJabatanFilter.set('');
    this.kategoriKebutuhanFilter.set('');
    this.reload();
  }

  openCreate(): void {
    if (this.bidangOptions().length === 0) {
      this.snackBar.open('Tambahkan bidang terlebih dahulu sebelum membuat pegawai.', 'Tutup', {
        duration: 4000,
      });
      return;
    }

    this.openFormDialog();
  }

  openEdit(row: Pegawai): void {
    this.openFormDialog(row);
  }

  remove(row: Pegawai): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Hapus pegawai',
        message: `Hapus pegawai "${row.nama}" (NIP ${row.nip})? Tindakan ini tidak dapat dibatalkan.`,
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

        this.pegawaiService
          .delete(row.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.snackBar.open('Pegawai dihapus.', 'Tutup', { duration: 3000 });
              this.rows.update((rows) => rows.filter((item) => item.id !== row.id));
              if (this.rows().length === 0 && this.hasMore()) this.loadMore();
            },
            error: (error: unknown) => {
              this.snackBar.open(apiErrorMessage(error, 'Gagal menghapus pegawai.'), 'Tutup', {
                duration: 5000,
              });
            },
          });
      });
  }

  isSelf(row: Pegawai): boolean {
    return this.auth.user()?.id === row.id;
  }

  pangkatText(row: Pegawai): string {
    return pangkatLabel(row.pangkat_golongan);
  }

  roleText(row: Pegawai): string {
    return roleLabel(row.role);
  }

  statusText(row: Pegawai): string {
    return statusLabel(row.status);
  }

  statusClass(row: Pegawai): string {
    return row.status === 'aktif' ? 'chip chip-active' : 'chip chip-inactive';
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

    const label = reset ? 'Gagal memuat data pegawai.' : 'Gagal memuat data berikutnya.';

    this.pegawaiService
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

  private query(): PegawaiQuery {
    const cursor = this.nextCursor();
    const search = this.search().trim();

    return {
      ...(cursor ? { cursor: cursor.id, cursorValue: cursor.value } : {}),
      sort: this.sort().active,
      order: this.sort().direction,
      search: search || undefined,
      role: this.roleFilter() || undefined,
      status: this.statusFilter() || undefined,
      bidangId: this.bidangFilter() === '' ? undefined : Number(this.bidangFilter()),
      pangkatGolonganId: this.pangkatFilter() === '' ? undefined : Number(this.pangkatFilter()),
      kategoriJabatan: this.kategoriJabatanFilter() || undefined,
      kategoriKebutuhanJamPelatihan: this.kategoriKebutuhanFilter() || undefined,
    };
  }

  private openFormDialog(pegawai?: Pegawai): void {
    const ref = this.dialog.open<PegawaiFormDialog, PegawaiFormDialogData, boolean>(
      PegawaiFormDialog,
      {
        ...dialogConfig,
        data: {
          pegawai,
          bidangOptions: this.bidangOptions(),
          pangkatOptions: this.pangkatOptions(),
        },
        autoFocus: 'first-tabbable',
      },
    );

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved) => {
        if (!saved) return;

        this.snackBar.open(
          pegawai ? 'Data pegawai diperbarui.' : 'Pegawai baru ditambahkan.',
          'Tutup',
          { duration: 3000 },
        );
        this.reload();
      });
  }

  private loadLookups(): void {
    forkJoin({
      bidang: this.bidangService.listAll().pipe(catchError(() => of([]))),
      pangkat: this.pangkatService.listAll().pipe(catchError(() => of([]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ bidang, pangkat }) => {
        this.bidangOptions.set(bidang);
        this.pangkatOptions.set(pangkat);
      });
  }
}
