// Posting habits: how often and how steadily you post. Works on the
// normalized posts from lib/analysis (needs .at in ms and .platform).

const DAY = 86400000;

export function dayKey(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function startOfDay(ms) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Weeks start Monday.
export function startOfWeek(ms) {
  const d = new Date(startOfDay(ms));
  const back = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - back);
  return d.getTime();
}

function addDays(ms, n) {
  const d = new Date(ms);
  d.setDate(d.getDate() + n);
  return d.getTime();
}

// Posts per day: Map(dayKey → { total, byPlatform }).
export function postsByDay(posts) {
  const map = new Map();
  posts.forEach((p) => {
    if (!p.at) return;
    const k = dayKey(p.at);
    const row = map.get(k) || { total: 0, byPlatform: {} };
    row.total += 1;
    row.byPlatform[p.platform] = (row.byPlatform[p.platform] || 0) + 1;
    map.set(k, row);
  });
  return map;
}

// Calendar grid: `weeks` columns of Mon..Sun ending this week.
export function calendar(posts, now = Date.now(), weeks = 26) {
  const byDay = postsByDay(posts);
  const first = addDays(startOfWeek(now), -7 * (weeks - 1));
  const today = startOfDay(now);
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const at = addDays(first, w * 7 + d);
      const row = byDay.get(dayKey(at));
      return { at, count: row?.total || 0, byPlatform: row?.byPlatform || {}, future: at > today };
    }),
  );
}

// Posts per week for the last `weeks` weeks, oldest first.
export function weeklyCounts(posts, now = Date.now(), weeks = 12) {
  const thisWeek = startOfWeek(now);
  const rows = Array.from({ length: weeks }, (_, i) => ({
    week: addDays(thisWeek, -7 * (weeks - 1 - i)),
    total: 0,
    byPlatform: {},
  }));
  const index = new Map(rows.map((r, i) => [r.week, i]));
  posts.forEach((p) => {
    if (!p.at) return;
    const i = index.get(startOfWeek(p.at));
    if (i == null) return;
    rows[i].total += 1;
    rows[i].byPlatform[p.platform] = (rows[i].byPlatform[p.platform] || 0) + 1;
  });
  return rows;
}

// Weeks in a row (ending this week, or last week if this one is still empty)
// that hit the goal.
export function weekStreak(posts, goal, now = Date.now()) {
  const counts = weeklyCounts(posts, now, 104).reverse();
  let i = counts[0].total >= goal ? 0 : 1;
  let streak = 0;
  for (; i < counts.length && counts[i].total >= goal; i++) streak += 1;
  return streak;
}

// Longest stretch of days with no post in the last `days` days.
export function longestGap(posts, now = Date.now(), days = 90) {
  const from = startOfDay(now) - (days - 1) * DAY;
  const posted = new Set(posts.filter((p) => p.at >= from).map((p) => dayKey(p.at)));
  let best = 0;
  let run = 0;
  for (let at = from; at <= startOfDay(now); at = addDays(at, 1)) {
    if (posted.has(dayKey(at))) run = 0;
    else best = Math.max(best, ++run);
  }
  return best;
}

export function daysSinceLast(posts, now = Date.now()) {
  const last = Math.max(0, ...posts.map((p) => p.at || 0));
  if (!last) return null;
  return Math.round((startOfDay(now) - startOfDay(last)) / DAY);
}

export function habits(posts, { goal = 3, now = Date.now() } = {}) {
  const weeks = weeklyCounts(posts, now, 12);
  const done = weeks.slice(0, -1); // this week isn't over
  const avg = done.length ? done.reduce((s, w) => s + w.total, 0) / done.length : 0;
  return {
    thisWeek: weeks[weeks.length - 1].total,
    avgPerWeek: avg,
    goalHitRate: done.length ? done.filter((w) => w.total >= goal).length / done.length : 0,
    streak: weekStreak(posts, goal, now),
    longestGap: longestGap(posts, now),
    daysSinceLast: daysSinceLast(posts, now),
    weeks,
  };
}
