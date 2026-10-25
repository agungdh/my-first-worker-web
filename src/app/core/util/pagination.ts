import { EMPTY, expand, type Observable, reduce } from 'rxjs';
import type { Page } from '../models/api.models';

/** Safety net so a broken endpoint cannot loop forever. */
const MAX_PAGES = 50;

export interface Cursor {
  id: number;
  value: string | null;
}

/** The API only paginates by keyset, so the next page is driven by its cursor. */
export function toCursor(page: Page<unknown>): Cursor | null {
  if (!page.hasMore || page.nextCursor === null) return null;

  return { id: page.nextCursor, value: page.nextCursorValue };
}

/** Reads every page of a list endpoint. Only for small lookup tables. */
export function collectPages<T>(
  fetchPage: (cursor: Cursor | null) => Observable<Page<T>>,
): Observable<T[]> {
  return fetchPage(null).pipe(
    expand((page, index) => {
      const cursor = toCursor(page);

      return cursor && index + 1 < MAX_PAGES ? fetchPage(cursor) : EMPTY;
    }),
    reduce((all: T[], page) => [...all, ...page.items], [] as T[]),
  );
}
