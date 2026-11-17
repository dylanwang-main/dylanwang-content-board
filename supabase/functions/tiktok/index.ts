// TikTok login handoff and API proxy. The client secret lives only here
// (Supabase secrets TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET), tokens live in
// public.tiktok_tokens which no browser role can read, and TikTok's API
// (no browser CORS) is reached through the "api" action.
import { createClient } from "jsr:@supabase/supabase-js@2";

const CLIENT_KEY = Deno.env.get("TIKTOK_CLIENT_KEY") ?? "";
const CLIENT_SECRET = Deno.env.get("TIKTOK_CLIENT_SECRET") ?? "";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const ALLOWED = new Set(["/v2/user/info/", "/v2/video/list/", "/v2/video/query/"]);

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function tokenRequest(params: Record<string, string>) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_key: CLIENT_KEY, client_secret: CLIENT_SECRET, ...params }),
  });
  const data = await res.json();
  if (!res.ok || data.error || !data.access_token) {
    throw new Error(data.error_description || data.message || data.error || "TikTok token request failed");
  }
  return data;
}

async function saveTokens(userId: string, t: any) {
  const now = Date.now();
  const { error } = await admin.from("tiktok_tokens").upsert({
    user_id: userId,
    open_id: t.open_id,
    scope: t.scope,
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: new Date(now + (t.expires_in ?? 86400) * 1000).toISOString(),
    refresh_expires_at: new Date(now + (t.refresh_expires_in ?? 31536000) * 1000).toISOString(),
    updated_at: new Date(now).toISOString(),
  });
  if (error) throw new Error(error.message);
}

async function freshToken(userId: string) {
  const { data: row } = await admin.from("tiktok_tokens").select("*").eq("user_id", userId).maybeSingle();
  if (!row) throw new Error("TikTok is not connected. Connect it in Settings → Channels.");
  if (Date.parse(row.expires_at) - Date.now() > 60_000) return row.access_token as string;
  const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: row.refresh_token });
  await saveTokens(userId, t);
  return t.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: auth } = await admin.auth.getUser(jwt);
    const user = auth?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    if (!CLIENT_KEY || !CLIENT_SECRET) return json({ error: "TikTok isn't set up on the server yet." }, 500);

    switch (body.action) {
      case "config":
        return json({ client_key: CLIENT_KEY });

      case "exchange": {
        const t = await tokenRequest({
          grant_type: "authorization_code",
          code: String(body.code ?? ""),
          redirect_uri: String(body.redirect_uri ?? ""),
        });
        await saveTokens(user.id, t);
        await admin.from("profiles").update({ tiktok_connected_at: new Date().toISOString() }).eq("id", user.id);
        return json({ connected: true });
      }

      case "disconnect":
        await admin.from("tiktok_tokens").delete().eq("user_id", user.id);
        await admin.from("profiles").update({ tiktok_connected_at: null }).eq("id", user.id);
        return json({ connected: false });

      case "api": {
        const url = new URL(String(body.path ?? ""), "https://open.tiktokapis.com");
        if (url.origin !== "https://open.tiktokapis.com" || !ALLOWED.has(url.pathname)) {
          return json({ error: "Not allowed" }, 400);
        }
        const token = await freshToken(user.id);
        const res = await fetch(url, {
          method: body.method === "POST" ? "POST" : "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: body.method === "POST" ? JSON.stringify(body.body ?? {}) : undefined,
        });
        return json({ status: res.status, data: await res.json() });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
