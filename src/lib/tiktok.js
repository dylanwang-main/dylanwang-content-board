// Browser side of the TikTok connection. Everything that needs the client
// secret or TikTok's API goes through the "tiktok" Supabase edge function.
import { getSupabase } from "../api/db.js";

export const TIKTOK_SCOPES = "user.info.basic,user.info.profile,user.info.stats,video.list";
const STATE_KEY = "cc.tiktokState";

export function tiktokRedirectUri() {
  return `${window.location.origin}/auth/tiktok`;
}

export async function tiktokCall(action, payload = {}) {
  const { data, error } = await getSupabase().functions.invoke("tiktok", { body: { action, ...payload } });
  if (error) {
    let message = error.message;
    try {
      const body = await error.context?.json?.();
      if (body?.error) message = body.error;
    } catch {
      // keep the generic message
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export function buildAuthorizeUrl(clientKey, redirectUri, state) {
  const params = new URLSearchParams({
    client_key: clientKey,
    scope: TIKTOK_SCOPES,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
}

export async function startTikTokLogin() {
  const { client_key } = await tiktokCall("config");
  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);
  window.location.assign(buildAuthorizeUrl(client_key, tiktokRedirectUri(), state));
}

export function checkTikTokState(state) {
  const expected = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return Boolean(state) && state === expected;
}

// fetch-like call to TikTok's API through the proxy. Returns { ok, json() }.
export async function tiktokFetch(path, { method = "GET", body } = {}) {
  const res = await tiktokCall("api", { path, method, body });
  return { ok: res.status >= 200 && res.status < 300, status: res.status, json: async () => res.data };
}
