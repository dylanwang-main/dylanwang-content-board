import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortVideos, engagementRate } from '../src/lib/videoFilters.js';

const videos = [
  { id: 'a', title: 'UCSD tour', format: 'short_form', published_at: '2026-11-07', view_count: 200, like_count: 10, comment_count: 0 },
  { id: 'b', title: 'Tier list of my life', description: 'ranking everything', format: 'long_form', published_at: '2026-11-14', view_count: 0, like_count: 0, comment_count: 0 },
  { id: 'c', title: 'Half a heart', format: 'short_form', published_at: '2026-11-09', view_count: 1200, like_count: 19, comment_count: 1 },
];
const ids = (list) => list.map((v) => v.id);

test('default is newest first', () => {
  assert.deepEqual(ids(filterAndSortVideos(videos)), ['b', 'c', 'a']);
});

test('format filter keeps only that format', () => {
  assert.deepEqual(ids(filterAndSortVideos(videos, { format: 'long_form' })), ['b']);
  assert.deepEqual(ids(filterAndSortVideos(videos, { format: 'short_form', sort: 'oldest' })), ['a', 'c']);
});

test('search matches title or description, case-insensitive', () => {
  assert.deepEqual(ids(filterAndSortVideos(videos, { query: 'ucsd' })), ['a']);
  assert.deepEqual(ids(filterAndSortVideos(videos, { query: 'RANKING' })), ['b']);
});

test('sorts by views, and by engagement with unmeasured videos last', () => {
  assert.deepEqual(ids(filterAndSortVideos(videos, { sort: 'views' })), ['c', 'a', 'b']);
  // a: 10/200 = 5%, c: 20/1200 = 1.7%, b: no views
  assert.deepEqual(ids(filterAndSortVideos(videos, { sort: 'engagement' })), ['a', 'c', 'b']);
  assert.equal(engagementRate(videos[1]), null);
});

test('does not mutate the input list', () => {
  const before = ids(videos);
  filterAndSortVideos(videos, { sort: 'views' });
  assert.deepEqual(ids(videos), before);
});

test('visibility filter matches privacy_status', () => {
  const list = [
    { id: 'p', privacy_status: 'public', published_at: '2026-01-03' },
    { id: 'u', privacy_status: 'unlisted', published_at: '2026-01-02' },
    { id: 'x', privacy_status: 'private', published_at: '2026-01-01' },
  ];
  assert.deepEqual(ids(filterAndSortVideos(list, { visibility: 'unlisted' })), ['u']);
  assert.deepEqual(ids(filterAndSortVideos(list, { visibility: 'all' })), ['p', 'u', 'x']);
});
