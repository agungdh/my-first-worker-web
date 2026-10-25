import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, type MatDialogConfig } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { apiErrorMessage } from '../../core/http/api-error';
import type { Image } from '../../core/models/api.models';
import { ImageService } from '../../core/services/image.service';
import { formatBytes } from '../../core/util/image-compress';
import { ConfirmDialog, type ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog';
import { ImageFormDialog, type ImageFormDialogData } from './image-form-dialog/image-form-dialog';

const dialogConfig: MatDialogConfig = {
  width: '560px',
  maxWidth: '94vw',
};

@Component({
  selector: 'app-images-page',
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
  ],
  templateUrl: './images-page.html',
  styleUrl: './images-page.scss',
})
export class ImagesPage {
  private readonly imagesService = inject(ImageService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly formatBytes = formatBytes;

  readonly images = signal<Image[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly search = signal('');

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.images();

    return this.images().filter((image) => image.filename.toLowerCase().includes(term));
  });

  readonly totalSize = computed(() =>
    formatBytes(this.images().reduce((total, image) => total + image.size, 0)),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.imagesService.listAll().subscribe({
      next: (images) => {
        this.images.set(images);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loadError.set(apiErrorMessage(error, 'Could not load images.'));
        this.loading.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.search.set('');
  }

  openUpload(): void {
    this.openDialog({});
  }

  openEdit(image: Image): void {
    this.openDialog({ image });
  }

  confirmDelete(image: Image): void {
    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        width: '420px',
        maxWidth: '94vw',
        data: {
          title: 'Delete this image?',
          message: `“${image.filename}” will be removed from storage permanently.`,
          confirmLabel: 'Delete image',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) this.deleteImage(image);
      });
  }

  private openDialog(data: ImageFormDialogData): void {
    this.dialog
      .open<ImageFormDialog, ImageFormDialogData, Image>(ImageFormDialog, {
        ...dialogConfig,
        data,
      })
      .afterClosed()
      .subscribe((image) => {
        if (!image) return;

        this.snackBar.open(
          this.images().some((item) => item.id === image.id) ? 'Image updated' : 'Image uploaded',
          'Dismiss',
          { duration: 3500 },
        );
        this.load();
      });
  }

  private deleteImage(image: Image): void {
    this.imagesService.delete(image.id).subscribe({
      next: () => {
        this.snackBar.open('Image deleted', 'Dismiss', { duration: 3500 });
        this.load();
      },
      error: (error: unknown) => {
        this.snackBar.open(apiErrorMessage(error, 'Could not delete the image.'), 'Dismiss', {
          duration: 6000,
        });
      },
    });
  }
}
