import { of } from 'rxjs';
import type { Page } from '../models/api.models';
import { collectPages, toCursor } from './pagination';

describe('pagination', () => {
  it('derives the next cursor only when another page exists', () => {
    expect(toCursor({ items: [], nextCursor: 7, nextCursorValue: 'Budi', hasMore: true })).toEqual({
      id: 7,
      value: 'Budi',
    });
    expect(
      toCursor({ items: [], nextCursor: null, nextCursorValue: null, hasMore: false }),
    ).toBeNull();
    expect(
      toCursor({ items: [], nextCursor: 7, nextCursorValue: 'Budi', hasMore: false }),
    ).toBeNull();
  });

  it('follows the cursor until has_more is false', () => {
    const first: Page<number> = {
      items: [1, 2],
      nextCursor: 2,
      nextCursorValue: 'dua',
      hasMore: true,
    };
    const second: Page<number> = {
      items: [3],
      nextCursor: null,
      nextCursorValue: null,
      hasMore: false,
    };
    const cursors: ReturnType<typeof toCursor>[] = [];
    let collected: number[] = [];

    collectPages((cursor) => {
      cursors.push(cursor);
      return of(cursor === null ? first : second);
    }).subscribe((items) => {
      collected = items;
    });

    expect(collected).toEqual([1, 2, 3]);
    expect(cursors).toEqual([null, { id: 2, value: 'dua' }]);
  });
});
