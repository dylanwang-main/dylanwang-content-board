import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortMedia, isReel, mediaEngagementRate } from '../src/lib/mediaFilters.js';

const media = [
  { id: 'a', media_product_type: 'REELS', media_type: 'VIDEO', caption: 'gym day', timestamp: '2026-01-01', view_count: 1000, like_count: 50, shares_count: 30 },
  { id: 'b', media_product_type: 'FEED', media_type: 'CAROUSEL_ALBUM', caption: 'ucsd photos', timestamp: '2026-02-01', like_count: 80 },
  { id: 'c', media_type: 'VIDEO', caption: 'climbing', timestamp: '2026-03-01', view_count: 200, like_count: 40, shares_count: 2 },
];

test('reel detection prefers media_product_type, falls back to VIDEO', () => {
  assert.equal(isReel(media[0]), true);
  assert.equal(isReel(media[1]), false);
  assert.equal(isReel(media[2]), true);
});

test('type filter, search, and sorts', () => {
  assert.deepEqual(filterAndSortMedia(media, { type: 'reels' }).map((m) => m.id), ['c', 'a']);
  assert.deepEqual(filterAndSortMedia(media, { type: 'posts' }).map((m) => m.id), ['b']);
  assert.deepEqual(filterAndSortMedia(media, { query: 'UCSD' }).map((m) => m.id), ['b']);
  assert.deepEqual(filterAndSortMedia(media, { sort: 'shares' }).map((m) => m.id), ['a', 'c', 'b']);
  assert.deepEqual(filterAndSortMedia(media, { sort: 'oldest' }).map((m) => m.id), ['a', 'b', 'c']);
  assert.deepEqual(filterAndSortMedia(media, { sort: 'engagement' }).map((m) => m.id), ['c', 'a', 'b']);
});

test('engagement is null without views', () => {
  assert.equal(mediaEngagementRate(media[1]), null);
  assert.equal(mediaEngagementRate(media[0]), 0.08);
});

test('trial reels are hidden by default and shown on request', () => {
  const list = [
    { id: 'r', media_product_type: 'REELS', is_shared_to_feed: true },
    { id: 't', media_product_type: 'REELS', is_shared_to_feed: false },
    { id: 'p', media_product_type: 'FEED', is_shared_to_feed: false },
  ];
  assert.deepEqual(filterAndSortMedia(list).map((m) => m.id).sort(), ['p', 'r']);
  assert.equal(filterAndSortMedia(list, { hideTrials: false }).length, 3);
});
