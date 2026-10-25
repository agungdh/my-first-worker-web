import {
  afterNextRender,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';

/**
 * Emits `scrolled` whenever the host element gets close to the viewport.
 * Keyset-paginated lists use it to append the next page.
 */
@Directive({ selector: '[appInfiniteScroll]' })
export class InfiniteScrollDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly appInfiniteScrollDisabled = input(false);
  readonly scrolled = output<void>();

  private observer: IntersectionObserver | null = null;

  constructor() {
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;

      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) this.scrolled.emit();
        },
        { rootMargin: '200px' },
      );

      this.syncObservation();
      this.destroyRef.onDestroy(() => this.observer?.disconnect());
    });

    // Re-observing after a page settles makes the observer fire again while the
    // sentinel is still visible, so short pages keep filling without scrolling.
    effect(() => {
      this.appInfiniteScrollDisabled();
      this.syncObservation();
    });
  }

  private syncObservation(): void {
    const observer = this.observer;
    if (!observer) return;

    observer.disconnect();
    if (!this.appInfiniteScrollDisabled()) observer.observe(this.element.nativeElement);
  }
}
