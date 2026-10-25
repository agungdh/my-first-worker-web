import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { apiErrorMessage } from '../../../core/http/api-error';
import type { Image } from '../../../core/models/api.models';
import { ImageService } from '../../../core/services/image.service';
import { compressImage, formatBytes, MAX_IMAGE_LABEL } from '../../../core/util/image-compress';
import { imageFormSchema, type ImageFormModel } from '../../../core/validation/form-schemas';

export interface ImageFormDialogData {
  image?: Image;
}

@Component({
  selector: 'app-image-form-dialog',
  imports: [
    FormField,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './image-form-dialog.html',
  styleUrl: './image-form-dialog.scss',
})
export class ImageFormDialog {
  readonly data = inject<ImageFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ImageFormDialog, Image>);
  private readonly images = inject(ImageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isEdit = !!this.data.image;
  readonly maxLabel = MAX_IMAGE_LABEL;

  readonly saving = signal(false);
  readonly compressing = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly previewUrl = signal<string | null>(this.data.image?.url ?? null);
  readonly compressed = signal<Blob | null>(null);

  readonly compressedLabel = computed(() => {
    const blob = this.compressed();
    return blob ? formatBytes(blob.size) : null;
  });

  readonly currentLabel = computed(() =>
    this.data.image ? formatBytes(this.data.image.size) : null,
  );

  readonly submitLabel = computed(() => {
    if (!this.isEdit) return 'Upload image';
    return this.compressed() ? 'Replace image' : 'Save changes';
  });

  private readonly model = signal<ImageFormModel>({
    filename: this.data.image?.filename ?? '',
  });

  readonly form = form(this.model, imageFormSchema);

  private objectUrl: string | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.releaseObjectUrl());
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Pick an image file.');
      return;
    }

    this.compressing.set(true);
    this.errorMessage.set(null);
    this.compressed.set(null);

    try {
      const blob = await compressImage(file);

      this.compressed.set(blob);
      this.setPreview(URL.createObjectURL(blob));
      this.form.filename().value.set(file.name);
    } catch (error) {
      this.compressed.set(null);
      this.setPreview(this.data.image?.url ?? null);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not compress the image.',
      );
    } finally {
      this.compressing.set(false);
    }
  }

  save(event: Event): void {
    event.preventDefault();

    if (this.saving() || this.compressing()) return;

    const state = this.form();
    if (state.invalid()) {
      state.markAsTouched();
      return;
    }

    const image = this.data.image;
    const blob = this.compressed();
    const filename = state.value().filename.trim();

    if (!image && !blob) {
      this.errorMessage.set('Choose an image to upload.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const request = blob
      ? image
        ? this.images.replace(image.id, blob, filename)
        : this.images.upload(blob, filename)
      : this.images.rename(image!.id, image!.key, filename);

    request.subscribe({
      next: (saved) => this.dialogRef.close(saved),
      error: (error: unknown) => {
        this.saving.set(false);
        this.errorMessage.set(apiErrorMessage(error, 'Could not save the image.'));
      },
    });
  }

  private setPreview(url: string | null): void {
    this.releaseObjectUrl();

    if (url?.startsWith('blob:')) this.objectUrl = url;
    this.previewUrl.set(url);
  }

  private releaseObjectUrl(): void {
    if (!this.objectUrl) return;

    URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = null;
  }
}
