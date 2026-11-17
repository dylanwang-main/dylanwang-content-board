import { test } from 'node:test';
import assert from 'node:assert/strict';
import { headline, median, timecode, toPosts, topPosts } from '../src/lib/insights.js';

const v = (title, views) => ({ id: title, title, view_count: views });

test('one dominant video is called out with its share', () => {
  const posts = toPosts({ videos: [v('Dorm tour', 31760), v('Beach', 1663), v('Day 1', 2301), v('Rest', 14576)] });
  const h = headline(posts);
  assert.equal(h.title, 'One video did 63% of your views.');
  assert.match(h.detail, /Dorm tour/);
});

test('no dominant video falls back to median comparison', () => {
  // best is 37% of views (under the 40% rule) but 3.5x the median
  const posts = toPosts({ videos: [...'abcdef'].map((k) => v(k, 100)).concat(v('g', 350)) });
  assert.equal(headline(posts).title, 'Your best video beat your median by 4x.');
});

test('empty data gives an honest empty state', () => {
  assert.equal(headline([]).title, 'Nothing posted yet.');
});

test('library posts are used when no videos are synced', () => {
  const posts = toPosts({ items: [{ id: 1, title: 'x', status: 'published', views: 5 }, { id: 2, title: 'y', status: 'idea', views: 99 }] });
  assert.deepEqual(posts.map((p) => p.id), [1]);
});

test('helpers', () => {
  assert.equal(median([1, 3, 2]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(timecode(32), '00:32');
  assert.equal(timecode(558), '09:18');
  assert.deepEqual(topPosts([{ views: 1 }, { views: 9 }], 1), [{ views: 9 }]);
});
