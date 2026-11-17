// Instagram connection for the owner's own creator account. The token comes
// from the Meta developer dashboard ("Generate token"), lives in the owner's
// profile row (readable only by them), and is refreshed here so it doesn't
// expire: long-lived Instagram tokens can be refreshed with the token alone.
const REFRESH_URL = 'https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=';
const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;

export function needsRefresh(refreshedAt, now = Date.now()) {
  const t = Date.parse(refreshedAt || '');
  return Number.isNaN(t) || now - t > REFRESH_AFTER_MS;
}

// Returns a usable token, refreshing (and saving) it at most once a day.
// A failed refresh keeps the current token; the sync reports any real error.
export async function instagramToken(me, saveMe, fetchImpl = fetch) {
  const token = me?.instagram_token;
  if (!token) return null;
  // Facebook-style system user tokens (Unified login) never expire.
  if (!isInstagramLoginToken(token)) return token;
  if (!needsRefresh(me.instagram_token_refreshed_at)) return token;
  try {
    const res = await fetchImpl(REFRESH_URL + encodeURIComponent(token));
    const data = await res.json();
    if (res.ok && data.access_token) {
      await saveMe({ instagram_token: data.access_token, instagram_token_refreshed_at: new Date().toISOString() });
      return data.access_token;
    }
  } catch {
    // keep the existing token
  }
  return token;
}

// Two token kinds come out of the Meta dashboard:
// - Instagram Login tokens (IGAA…) talk to graph.instagram.com as "me".
// - Unified login / system user tokens (EAA…) talk to graph.facebook.com and
//   need the Instagram account ID (the number under the username in Meta).
export function isInstagramLoginToken(token) {
  return /^IG/.test(token || '');
}

export function instagramEndpoint(token, igUserId) {
  if (isInstagramLoginToken(token)) return { base: 'https://graph.instagram.com', node: 'me' };
  const id = String(igUserId || '').trim();
  if (!id) throw new Error('Add your Instagram account ID in Settings → Channels (the number under your username in Meta).');
  return { base: 'https://graph.facebook.com/v21.0', node: id };
}
