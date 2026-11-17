// Verifies the Base44-compatible data layer translates calls into the right Supabase queries.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeEntity, makeAuth } from '../src/api/db.js';

function fakeClient(result = { data: [], error: null }) {
  const calls = [];
  const builder = new Proxy({}, {
    get(_, prop) {
      if (prop === 'then') return (res, rej) => Promise.resolve(result).then(res, rej);
      return (...args) => { calls.push([prop, ...args]); return builder; };
    },
  });
  return { calls, from: (t) => { calls.push(['from', t]); return builder; } };
}

test('list with Base44 sort and limit returns { items }', async () => {
  const c = fakeClient({ data: [{ id: 'a' }], error: null });
  const page = await makeEntity('content_items', c).list({ sort: '-updated_date', limit: 500 });
  assert.deepEqual(page, { items: [{ id: 'a' }] });
  assert.deepEqual(c.calls, [
    ['from', 'content_items'], ['select', '*'],
    ['order', 'updated_date', { ascending: false }], ['limit', 500],
  ]);
});

test('legacy positional list(sort, limit)', async () => {
  const c = fakeClient();
  await makeEntity('brands', c).list('created_date', 1);
  assert.deepEqual(c.calls.slice(2), [['order', 'created_date', { ascending: true }], ['limit', 1]]);
});

test('filter maps fields to eq and null to is', async () => {
  const c = fakeClient({ data: null, error: null });
  const page = await makeEntity('outliers', c).filter({ platform: 'youtube', hook: null }, { limit: 1 });
  assert.deepEqual(c.calls.slice(2), [['eq', 'platform', 'youtube'], ['is', 'hook', null], ['limit', 1]]);
  assert.deepEqual(page, { items: [] });
});

test('update targets the id and returns the row', async () => {
  const c = fakeClient({ data: { id: 'a', status: 'learned' }, error: null });
  const row = await makeEntity('brain_files', c).update('a', { status: 'learned' });
  assert.equal(row.status, 'learned');
  assert.deepEqual(c.calls.slice(1, 3), [['update', { status: 'learned' }], ['eq', 'id', 'a']]);
});

test('errors surface as thrown Errors', async () => {
  const c = fakeClient({ data: null, error: { message: 'boom' } });
  await assert.rejects(makeEntity('research', c).get('x'), /boom/);
});

test('auth.me merges profile and returns null when signed out', async () => {
  const c = fakeClient({ data: { display_name: 'D', monthly_goal: 8 }, error: null });
  c.auth = { getUser: async () => ({ data: { user: { id: 'u1', email: 'e@x.com', user_metadata: {} } } }) };
  const me = await makeAuth(c).me();
  assert.equal(me.id, 'u1');
  assert.equal(me.monthly_goal, 8);
  c.auth.getUser = async () => ({ data: { user: null } });
  assert.equal(await makeAuth(c).me(), null);
});


test('bulkCreate inserts many rows; bulkUpdate upserts on id', async () => {
  const c = fakeClient({ data: [], error: null });
  const e = makeEntity('youtube_videos', c);
  await e.bulkCreate([{ video_id: 'a' }, { video_id: 'b' }]);
  assert.deepEqual(c.calls[1], ['insert', [{ video_id: 'a' }, { video_id: 'b' }]]);
  c.calls.length = 0;
  await e.bulkUpdate([{ id: '1', view_count: 5 }]);
  assert.deepEqual(c.calls[1], ['upsert', [{ id: '1', view_count: 5 }], { onConflict: 'id' }]);
  c.calls.length = 0;
  assert.deepEqual(await e.bulkCreate([]), []);
  assert.equal(c.calls.length, 0);
});
