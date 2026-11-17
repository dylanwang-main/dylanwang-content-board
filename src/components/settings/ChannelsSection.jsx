import { useState, useSyncExternalStore } from "react";
import { format, parseISO } from "date-fns";
import { ExternalLink, Instagram, Loader2, Music2, RefreshCw, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMe, useSaveMe } from "@/hooks/useCreatorData";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useSyncYouTube } from "@/hooks/useYouTube";
import { useSyncInstagram } from "@/hooks/useInstagram";
import { useSyncTikTok } from "@/hooks/useTikTok";
import { useQueryClient } from "@tanstack/react-query";
import { startTikTokLogin, tiktokCall } from "@/lib/tiktok";
import { getYouTubeKey, setYouTubeKey } from "@/ai/keys";
import { compact } from "@/lib/insights";

const KEY_HELP_URL = "https://console.cloud.google.com/apis/library/youtube.googleapis.com";
const META_APPS_URL = "https://developers.facebook.com/apps/";

const subscribeKeys = (cb) => {
  window.addEventListener("cc-keys-changed", cb);
  return () => window.removeEventListener("cc-keys-changed", cb);
};

function synced(value) {
  const d = value ? parseISO(value) : null;
  return d && !Number.isNaN(d.getTime()) ? format(d, "MMM d, h:mm a") : null;
}

function Row({ icon: Icon, name, status, children, actions }) {
  return (
    <li className="border-b border-border last:border-b-0">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3.5">
        <Icon className="h-[18px] w-[18px] shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{status}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      </div>
      {children}
    </li>
  );
}

function YouTubeRow() {
  const { data: me } = useMe();
  const { data: accounts = [] } = useSocialAccounts();
  const saveMe = useSaveMe();
  const sync = useSyncYouTube();
  const savedKey = useSyncExternalStore(subscribeKeys, getYouTubeKey);
  const savedHandle = (me?.youtube_handle || "").replace(/^@+/, "");
  const account = accounts.find((a) => (a.platform || "").toLowerCase() === "youtube");
  const connected = Boolean(savedHandle && savedKey);

  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [key, setKey] = useState("");

  const startEditing = () => {
    setHandle(savedHandle ? `@${savedHandle}` : "");
    setKey("");
    setOpen(true);
  };

  const connect = async (e) => {
    e.preventDefault();
    const clean = handle.trim().replace(/^@+/, "");
    if (key.trim()) setYouTubeKey(key);
    await saveMe.mutateAsync({ youtube_handle: clean });
    setOpen(false);
    sync.mutate({ handle: clean });
  };

  const disconnect = async () => {
    setYouTubeKey("");
    await saveMe.mutateAsync({ youtube_handle: "" });
    setOpen(false);
  };

  const busy = sync.isPending || saveMe.isPending;
  const lastSynced = synced(account?.last_synced);
  const status = connected
    ? [
        `@${savedHandle}`,
        account && `${compact(account.follower_count)} subscribers`,
        account && `${compact(account.media_count)} videos`,
        lastSynced ? `synced ${lastSynced}` : "not synced yet",
      ]
        .filter(Boolean)
        .join(" · ")
    : "Not connected";

  return (
    <Row
      icon={Youtube}
      name="YouTube"
      status={status}
      actions={
        connected && !open ? (
          <>
            <Button variant="ghost" size="sm" onClick={startEditing}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => sync.mutate({ handle: savedHandle })} disabled={busy}>
              {sync.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              {sync.isPending ? "Syncing…" : "Sync"}
            </Button>
          </>
        ) : !open ? (
          <Button size="sm" onClick={startEditing}>
            Connect
          </Button>
        ) : null
      }
    >
      {open && (
        <form onSubmit={connect} className="space-y-4 border-t border-border bg-background/40 px-4 py-4 sm:pl-[46px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs text-muted-foreground">Channel handle</span>
              <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@yourchannel" required />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs text-muted-foreground">
                YouTube API key{savedKey ? " (saved, leave blank to keep)" : ""}
              </span>
              <Input
                type="password"
                autoComplete="off"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={savedKey ? "••••••••" : "AIza…"}
                required={!savedKey}
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Free, about 2 minutes: open{" "}
            <a href={KEY_HELP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground underline underline-offset-2">
              YouTube Data API in Google Cloud <ExternalLink className="h-3 w-3" />
            </a>
            , click Enable, then Credentials → Create credentials → API key. The key stays in this browser. Only public
            videos sync.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {connected ? "Save & sync" : "Connect & sync"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {connected && (
              <Button type="button" variant="ghost" size="sm" className="ml-auto text-destructive" onClick={disconnect}>
                Disconnect
              </Button>
            )}
          </div>
        </form>
      )}
      {sync.isError && <p className="px-4 pb-3 text-xs text-destructive sm:pl-[46px]">{sync.error.message}</p>}
    </Row>
  );
}

function InstagramRow() {
  const { data: me } = useMe();
  const { data: accounts = [] } = useSocialAccounts();
  const saveMe = useSaveMe();
  const sync = useSyncInstagram();
  const account = accounts.find((a) => (a.platform || "").toLowerCase() === "instagram");
  const connected = Boolean(me?.instagram_token);
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [igUserId, setIgUserId] = useState("");

  const connect = async (e) => {
    e.preventDefault();
    await saveMe.mutateAsync({
      instagram_token: token.trim(),
      instagram_user_id: igUserId.trim() || me?.instagram_user_id || null,
      // Unknown age: refresh it on the first sync.
      instagram_token_refreshed_at: null,
    });
    setToken("");
    setIgUserId("");
    setOpen(false);
    sync.mutate();
  };

  const disconnect = async () => {
    await saveMe.mutateAsync({ instagram_token: null, instagram_user_id: null, instagram_token_refreshed_at: null });
    setOpen(false);
  };

  const busy = sync.isPending || saveMe.isPending;
  const lastSynced = synced(account?.last_synced);
  const status = connected
    ? [
        account?.handle,
        account && `${compact(account.follower_count)} followers`,
        account && `${compact(account.media_count)} posts`,
        lastSynced ? `synced ${lastSynced}` : "not synced yet",
      ]
        .filter(Boolean)
        .join(" · ")
    : "Not connected · creator or business account";

  return (
    <Row
      icon={Instagram}
      name="Instagram"
      status={status}
      actions={
        connected && !open ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => sync.mutate()} disabled={busy}>
              {sync.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              {sync.isPending ? "Syncing…" : "Sync"}
            </Button>
          </>
        ) : !open ? (
          <Button size="sm" onClick={() => setOpen(true)}>
            Connect
          </Button>
        ) : null
      }
    >
      {open && (
        <form onSubmit={connect} className="space-y-4 border-t border-border bg-background/40 px-4 py-4 sm:pl-[46px]">
          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">
              Instagram access token{connected ? " (paste a new one to replace)" : ""}
            </span>
            <Input
              type="password"
              autoComplete="off"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="IGAA… or EAA…"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs text-muted-foreground">
              Instagram account ID (needed for tokens starting with EAA)
            </span>
            <Input
              inputMode="numeric"
              autoComplete="off"
              value={igUserId}
              onChange={(e) => setIgUserId(e.target.value)}
              placeholder={me?.instagram_user_id || "1784…"}
            />
          </label>
          <p className="text-xs text-muted-foreground">
            From your app in{" "}
            <a href={META_APPS_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground underline underline-offset-2">
              Meta for Developers <ExternalLink className="h-3 w-3" />
            </a>
            : Use cases → Customize → API setup → Generate token. The account ID is the number under your username there. Saved to
            your account only.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm" disabled={busy || !token.trim()}>
              {busy && <Loader2 className="animate-spin" />}
              {connected ? "Save & sync" : "Connect & sync"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {connected && (
              <Button type="button" variant="ghost" size="sm" className="ml-auto text-destructive" onClick={disconnect}>
                Disconnect
              </Button>
            )}
          </div>
        </form>
      )}
      {sync.isError && <p className="px-4 pb-3 text-xs text-destructive sm:pl-[46px]">{sync.error.message}</p>}
    </Row>
  );
}

function TikTokRow() {
  const { data: me } = useMe();
  const { data: accounts = [] } = useSocialAccounts();
  const sync = useSyncTikTok();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const account = accounts.find((a) => (a.platform || "").toLowerCase() === "tiktok");
  const connected = Boolean(me?.tiktok_connected_at);

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      await startTikTokLogin();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      await tiktokCall("disconnect");
      queryClient.invalidateQueries();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const lastSynced = synced(account?.last_synced);
  const status = connected
    ? [
        account?.handle,
        account && `${compact(account.follower_count)} followers`,
        account && `${compact(account.media_count)} videos`,
        lastSynced ? `synced ${lastSynced}` : "not synced yet",
      ]
        .filter(Boolean)
        .join(" · ")
    : "Not connected";

  return (
    <Row
      icon={Music2}
      name="TikTok"
      status={status}
      actions={
        connected && !open ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => sync.mutate()} disabled={sync.isPending || busy}>
              {sync.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              {sync.isPending ? "Syncing…" : "Sync"}
            </Button>
          </>
        ) : !connected ? (
          <Button size="sm" onClick={connect} disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            Connect
          </Button>
        ) : null
      }
    >
      {open && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-background/40 px-4 py-4 sm:pl-[46px]">
          <p className="w-full text-xs text-muted-foreground">
            Connected through TikTok login. Reconnect if sync stops working.
          </p>
          <Button size="sm" onClick={connect} disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            Reconnect
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto text-destructive"
            onClick={async () => {
              await disconnect();
              setOpen(false);
            }}
            disabled={busy}
          >
            Disconnect
          </Button>
        </div>
      )}
      {(error || sync.isError) && (
        <p className="px-4 pb-3 text-xs text-destructive sm:pl-[46px]">{error || sync.error.message}</p>
      )}
    </Row>
  );
}

// Every channel in one list: what's connected, what isn't, one button each.
export default function ChannelsSection() {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[15px] font-semibold">Channels</h2>
        <p className="mt-1 text-sm text-muted-foreground">Connect a channel to pull in your videos and numbers.</p>
      </div>
      <ul className="rounded-lg border border-border bg-card">
        <YouTubeRow />
        <InstagramRow />
        <TikTokRow />
      </ul>
    </section>
  );
}
