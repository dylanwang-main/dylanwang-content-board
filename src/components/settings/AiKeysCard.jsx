import { useState, useSyncExternalStore } from "react";
import { Eye, EyeOff, KeyRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Field from "@/components/kit/Field";
import { getAnthropicKey, getYouTubeKey, setAnthropicKey, setYouTubeKey } from "@/ai/keys";

const subscribe = (cb) => {
  window.addEventListener("cc-keys-changed", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("cc-keys-changed", cb);
    window.removeEventListener("storage", cb);
  };
};

const mask = (key) => (key ? `${key.slice(0, 7)}…${key.slice(-4)}` : "");

function KeyField({ label, hint, placeholder, getKey, setKey }) {
  const saved = useSyncExternalStore(subscribe, getKey);
  const [draft, setDraft] = useState("");
  const [show, setShow] = useState(false);

  if (saved) {
    return (
      <Field label={label} hint={hint}>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3">
          <span className="font-mono text-sm text-muted-foreground">{mask(saved)}</span>
          <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={() => setKey("")}>
            Remove
          </Button>
        </div>
      </Field>
    );
  }

  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={show ? "text" : "password"}
            autoComplete="off"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="rounded-xl pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={show ? "Hide key" : "Show key"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button
          type="button"
          className="rounded-full"
          disabled={!draft.trim()}
          onClick={() => {
            setKey(draft);
            setDraft("");
          }}
        >
          Save
        </Button>
      </div>
    </Field>
  );
}

// API keys for real AI and YouTube sync. Stored only in this browser.
export default function AiKeysCard() {
  const live = Boolean(useSyncExternalStore(subscribe, getAnthropicKey));

  return (
    <section className="space-y-5 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold">AI and API keys</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keys stay in this browser and go straight to Anthropic or Google. They are never sent to this app's
            servers.
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            live ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          {live ? <Sparkles className="h-3 w-3" /> : <KeyRound className="h-3 w-3" />}
          {live ? "Live AI" : "Demo mode"}
        </span>
      </div>

      {!live && (
        <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          Without a key, every AI feature returns clearly labeled sample output, so you can try the whole app for
          free.
        </p>
      )}

      <KeyField
        label="Claude API key"
        hint="From console.anthropic.com. Powers generation, research, Brain learning and breakdowns."
        placeholder="sk-ant-..."
        getKey={getAnthropicKey}
        setKey={setAnthropicKey}
      />
      <KeyField
        label="YouTube Data API key (optional)"
        hint="From Google Cloud. Enables YouTube channel sync and title research."
        placeholder="AIza..."
        getKey={getYouTubeKey}
        setKey={setYouTubeKey}
      />
    </section>
  );
}
