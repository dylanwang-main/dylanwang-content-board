import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calendar, daysSinceLast, habits, longestGap, startOfWeek, weekStreak, weeklyCounts } from '../src/lib/habits.js';

const now = new Date(2026, 10, 18, 12).getTime(); // Wed Nov 18 2026
const on = (y, m, d, platform = 'instagram') => ({ at: new Date(y, m, d, 10).getTime(), platform });

test('weeks start Monday', () => {
  assert.equal(new Date(startOfWeek(now)).getDate(), 16);
});

test('weekly counts and streak against a goal', () => {
  const posts = [
    on(2026, 10, 16), on(2026, 10, 17), on(2026, 10, 18), // this week: 3
    on(2026, 10, 9), on(2026, 10, 10), on(2026, 10, 12, 'tiktok'), // last week: 3
    on(2026, 10, 3), // week before: 1
  ];
  const w = weeklyCounts(posts, now, 3);
  assert.deepEqual(w.map((x) => x.total), [1, 3, 3]);
  assert.equal(w[1].byPlatform.tiktok, 1);
  assert.equal(weekStreak(posts, 3, now), 2);
  assert.equal(weekStreak(posts, 1, now), 3);
});

test('streak counts from last week while this week is empty', () => {
  assert.equal(weekStreak([on(2026, 10, 10)], 1, now), 1);
});

test('gaps and days since last post', () => {
  const posts = [on(2026, 10, 1), on(2026, 10, 11)];
  assert.equal(daysSinceLast(posts, now), 7);
  assert.equal(longestGap(posts, now, 18), 9);
  assert.equal(daysSinceLast([], now), null);
});

test('calendar is weeks × 7 with future days flagged', () => {
  const grid = calendar([on(2026, 10, 18)], now, 4);
  assert.equal(grid.length, 4);
  assert.equal(grid[3][2].count, 1);
  assert.equal(grid[3][6].future, true);
});

test('habits summary', () => {
  const h = habits([on(2026, 10, 16), on(2026, 10, 9)], { goal: 1, now });
  assert.equal(h.thisWeek, 1);
  assert.equal(h.streak, 2);
});
