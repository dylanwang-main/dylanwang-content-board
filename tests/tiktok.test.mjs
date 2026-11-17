import { test } from 'node:test';
import assert from 'node:assert/strict';

test('authorize URL carries key, scopes, redirect and state', async () => {
  const { buildAuthorizeUrl, TIKTOK_SCOPES } = await import('../src/lib/tiktok.js');
  const url = new URL(buildAuthorizeUrl('ck', 'https://x.app/auth/tiktok', 's1'));
  assert.equal(url.origin + url.pathname, 'https://www.tiktok.com/v2/auth/authorize/');
  assert.equal(url.searchParams.get('client_key'), 'ck');
  assert.equal(url.searchParams.get('scope'), TIKTOK_SCOPES);
  assert.equal(url.searchParams.get('redirect_uri'), 'https://x.app/auth/tiktok');
  assert.equal(url.searchParams.get('state'), 's1');
  assert.equal(url.searchParams.get('response_type'), 'code');
});
