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
    assert.match(url, /ig_refresh_token&access_token=IGold/);
    return new Response(JSON.stringify({ access_token: 'new', expires_in: 5184000 }));
  };
  const token = await instagramToken({ instagram_token: 'IGold' }, async (d) => { saved = d; }, fetchImpl);
  assert.equal(token, 'new');
  assert.equal(saved.instagram_token, 'new');
});

test('failed refresh keeps the current token; no token gives null', async () => {
  const fetchImpl = async () => new Response('{"error":{}}', { status: 400 });
  assert.equal(await instagramToken({ instagram_token: 'IGold' }, async () => {}, fetchImpl), 'IGold');
  assert.equal(await instagramToken({}, async () => {}), null);
});

import { instagramEndpoint, isInstagramLoginToken } from '../src/lib/instagram.js';

test('Instagram Login tokens use graph.instagram.com as me', () => {
  assert.equal(isInstagramLoginToken('IGAAxyz'), true);
  assert.deepEqual(instagramEndpoint('IGAAxyz'), { base: 'https://graph.instagram.com', node: 'me' });
});

test('Facebook-style tokens use graph.facebook.com with the account ID', () => {
  assert.deepEqual(instagramEndpoint('EAAxyz', ' 1784 '), { base: 'https://graph.facebook.com/v21.0', node: '1784' });
  assert.throws(() => instagramEndpoint('EAAxyz', ''), /account ID/);
});

test('Facebook-style tokens are never refreshed', async () => {
  const fetchImpl = async () => { throw new Error('should not fetch'); };
  assert.equal(await instagramToken({ instagram_token: 'EAAxyz' }, async () => {}, fetchImpl), 'EAAxyz');
});

import { fetchMediaInsights } from '../src/lib/instagram.js';

test('insights keep the metrics that worked and skip the ones that failed', async () => {
  const fetchImpl = async (url) => {
    const metric = new URL(url).searchParams.get('metric');
    if (metric === 'follows') return new Response('{"error":{"message":"nope"}}', { status: 400 });
    return new Response(JSON.stringify({ data: [{ name: metric, values: [{ value: 7 }] }] }));
  };
  const out = await fetchMediaInsights({ token: 'EAAx', igUserId: '1784', mediaId: 'm1', reel: true }, fetchImpl);
  assert.equal(out.views, 7);
  assert.equal(out.ig_reels_avg_watch_time, 7);
  assert.equal('follows' in out, false);
});
