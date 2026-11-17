import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breakdown, findings, fromInstagram, median, momentum, scorePosts, summary, tier } from '../src/lib/analysis.js';

const day = 86400000;
const post = (i, views, extra = {}) => ({
  id: String(i), platform: 'instagram', kind: 'reel', trial: false, format: 'Reel',
  at: Date.parse('2026-01-01T18:00:00Z') + i * day, views, likes: 1, comments: 0, shares: null,
  saves: null, seconds: null, text: 'x', ...extra,
});

test('median and tiers', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(tier(3), 'outlier');
  assert.equal(tier(1.5), 'above');
  assert.equal(tier(0.4), 'flop');
  assert.equal(tier(null), null);
});

test('scores against the median of the same pool only', () => {
  const posts = [post(1, 100), post(2, 100), post(3, 400), post(4, 10, { trial: true }), post(5, 30, { trial: true })];
  const s = scorePosts(posts);
  const by = Object.fromEntries(s.map((p) => [p.id, p]));
  assert.equal(by['3'].multiple, 4);
  assert.equal(by['3'].tier, 'outlier');
  assert.equal(by['4'].median, 20); // trials compared to trials
});

test('falls back to likes when there are no views', () => {
  const s = scorePosts([post(1, null, { likes: 10 }), post(2, null, { likes: 30 })]);
  assert.equal(s[0].metric, 'likes');
  assert.equal(s.find((p) => p.id === '2').multiple, 1.5);
});

test('normalizes Instagram trials', () => {
  const p = fromInstagram({ id: 'a', media_product_type: 'REELS', is_shared_to_feed: false, view_count: 5 });
  assert.equal(p.trial, true);
  assert.equal(p.kind, 'reel');
});

test('momentum compares last 10 to the 10 before', () => {
  const posts = scorePosts(Array.from({ length: 20 }, (_, i) => post(i, i < 10 ? 100 : 200)));
  const m = momentum(posts);
  assert.equal(m.change, 1);
});

test('findings call out a real gap and skip thin groups', () => {
  const posts = [];
  for (let i = 0; i < 6; i++) posts.push(post(i * 7, 1000, { text: '' }));       // same weekday, no caption
  for (let i = 0; i < 6; i++) posts.push(post(i * 7 + 1, 100, { text: 'a long caption '.repeat(10) }));
  const s = scorePosts(posts);
  assert.ok(breakdown(s).length >= 1);
  const f = findings(s);
  assert.ok(f.some((x) => /No caption run/.test(x.text)), JSON.stringify(f));
  assert.equal(summary(s).count, 12);
});
