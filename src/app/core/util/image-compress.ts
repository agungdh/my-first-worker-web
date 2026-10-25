export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_IMAGE_LABEL = '2 MB';

const MAX_DIMENSION = 2048;
const QUALITIES = [0.85, 0.7, 0.55, 0.4];

export class ImageTooLargeError extends Error {
  constructor() {
    super(`The compressed image is still larger than ${MAX_IMAGE_LABEL}. Pick a smaller image.`);
    this.name = 'ImageTooLargeError';
  }
}

export async function compressImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('This file could not be opened as an image.');
  }

  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser cannot compress images.');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    let smallest = 0;

    for (const quality of QUALITIES) {
      const blob = await toBlob(canvas, 'image/jpeg', quality);
      smallest = blob.size;

      if (blob.size <= MAX_IMAGE_BYTES) return blob;
    }

    throw new ImageTooLargeError();
  } finally {
    bitmap.close();
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image compression failed.'))),
      type,
      quality,
    );
  });
}
