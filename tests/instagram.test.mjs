import { test } from 'node:test';
import assert from 'node:assert/strict';
import { instagramToken, needsRefresh } from '../src/lib/instagram.js';

const day = 24 * 60 * 60 * 1000;

test('refreshes at most once a day', () => {
  const now = Date.parse('2026-11-17T00:00:00Z');
  assert.equal(needsRefresh(new Date(now - day / 2).toISOString(), now), false);
  assert.equal(needsRefresh(new Date(now - 2 * day).toISOString(), now), true);
  assert.equal(needsRefresh(null, now), true);
});

test('stale token is refreshed and saved', async () => {
  let saved;
  const fetchImpl = async (url) => {
    assert.match(url, /ig_refresh_token&access_token=old/);
    return new Response(JSON.stringify({ access_token: 'new', expires_in: 5184000 }));
  };
  const token = await instagramToken({ instagram_token: 'old' }, async (d) => { saved = d; }, fetchImpl);
  assert.equal(token, 'new');
  assert.equal(saved.instagram_token, 'new');
});

test('failed refresh keeps the current token; no token gives null', async () => {
  const fetchImpl = async () => new Response('{"error":{}}', { status: 400 });
  assert.equal(await instagramToken({ instagram_token: 'old' }, async () => {}, fetchImpl), 'old');
  assert.equal(await instagramToken({}, async () => {}), null);
});
