import { of } from 'rxjs';
import type { Page } from '../models/api.models';
import { collectPages, toCursor } from './pagination';

describe('pagination', () => {
  it('derives the next cursor only when another page exists', () => {
    expect(toCursor({ items: [], nextId: 7, hasMore: true })).toBe(7);
    expect(toCursor({ items: [], nextId: null, hasMore: false })).toBeNull();
    expect(toCursor({ items: [], nextId: 7, hasMore: false })).toBeNull();
    expect(toCursor({ items: [], nextId: null, hasMore: true })).toBeNull();
  });

  it('follows next_id until has_more is false', () => {
    const first: Page<number> = { items: [1, 2], nextId: 2, hasMore: true };
    const second: Page<number> = { items: [3], nextId: null, hasMore: false };
    const cursors: (number | null)[] = [];
    let collected: number[] = [];

    collectPages((id) => {
      cursors.push(id);
      return of(id === null ? first : second);
    }).subscribe((items) => {
      collected = items;
    });

    expect(collected).toEqual([1, 2, 3]);
    expect(cursors).toEqual([null, 2]);
  });
});
