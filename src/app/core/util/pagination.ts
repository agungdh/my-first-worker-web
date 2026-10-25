import { EMPTY, expand, type Observable, reduce } from 'rxjs';
import { PAGE_SIZE } from '../constants/pegawai';

/** Safety net so a broken endpoint cannot loop forever. */
const MAX_PAGES = 50;

/**
 * The API paginates with a 0-based `page` param and no total, so the only way to
 * know the next page exists is a full page of results.
 */
export function hasNextPage(items: readonly unknown[]): boolean {
  return items.length === PAGE_SIZE;
}

/** Reads every page of a list endpoint. Only for small lookup tables. */
export function collectPages<T>(fetchPage: (page: number) => Observable<T[]>): Observable<T[]> {
  function readFrom(page: number): Observable<T[]> {
    return fetchPage(page).pipe(
      expand((items) => (page + 1 < MAX_PAGES && hasNextPage(items) ? readFrom(page + 1) : EMPTY)),
    );
  }

  return readFrom(0).pipe(reduce((all, items) => [...all, ...items], [] as T[]));
}
