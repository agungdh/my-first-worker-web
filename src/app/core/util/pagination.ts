import { EMPTY, expand, type Observable, reduce } from 'rxjs';
import type { Page } from '../models/api.models';

/** Safety net so a broken endpoint cannot loop forever. */
const MAX_PAGES = 50;

/**
 * The API paginates by keyset and uses the last row's `id` as the only anchor,
 * so the next page is driven by `next_id`.
 */
export function toCursor(page: Page<unknown>): number | null {
  return page.hasMore ? page.nextId : null;
}

/** Reads every page of a list endpoint. Only for small lookup tables. */
export function collectPages<T>(
  fetchPage: (id: number | null) => Observable<Page<T>>,
): Observable<T[]> {
  return fetchPage(null).pipe(
    expand((page, index) => {
      const id = toCursor(page);

      return id !== null && index + 1 < MAX_PAGES ? fetchPage(id) : EMPTY;
    }),
    reduce((all: T[], page) => [...all, ...page.items], [] as T[]),
  );
}
