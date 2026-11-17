import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeMilestones } from '../src/lib/milestones.js';

const done = (rows) => rows.filter((r) => r.done).map((r) => r.label);

test('synced YouTube videos count toward publishing and view milestones', () => {
  const videos = Array.from({ length: 16 }, (_, i) => ({ view_count: i === 0 ? 31760 : 1000 }));
  const rows = computeMilestones({ items: [], videos });
  assert.deepEqual(done(rows), ['First piece published', '10 pieces published', 'First 10K-view piece']);
});

test('library posts marked YouTube are not double counted when videos are synced', () => {
  const items = [{ status: 'published', platform: 'YouTube', views: 90000 }, { status: 'published', platform: 'Instagram', views: 5000 }];
  const videos = [{ view_count: 90000 }];
  const total = computeMilestones({ items, videos }).find((r) => r.label === '100K total views');
  assert.equal(total.done, false); // 90K + 5K, not 185K
});

test('without synced videos, library posts still count', () => {
  const rows = computeMilestones({ items: [{ status: 'published', views: 12000 }] });
  assert.ok(done(rows).includes('First 10K-view piece'));
});
