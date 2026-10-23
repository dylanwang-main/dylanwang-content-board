import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import Field from "@/components/kit/Field";
import LogoUpload from "@/components/settings/LogoUpload";
import PlatformPicker from "@/components/settings/PlatformPicker";
import SettingsCard from "@/components/settings/SettingsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSaveMe } from "@/hooks/useCreatorData";

export default function SettingsForm({ me }) {
  const save = useSaveMe();
  const [justSaved, setJustSaved] = useState(false);
  const [form, setForm] = useState({
    display_name: me?.display_name || "",
    monthly_goal: me?.monthly_goal ? String(me.monthly_goal) : "",
    platforms: me?.platforms || [],
    logo_url: me?.logo_url || "",
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const accountName = me?.full_name?.trim() ? me.full_name : "your account name";
  const goal = String(form.monthly_goal).trim();

  const handleSubmit = async (event) => {
    event.preventDefault();

    await save.mutateAsync({
      display_name: form.display_name.trim(),
      monthly_goal: goal === "" ? null : Number(goal),
      platforms: form.platforms,
      logo_url: form.logo_url,
    });

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SettingsCard title="Profile & look">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Display name" hint={`Defaults to ${accountName}`}>
            <Input
              className="rounded-xl"
              value={form.display_name}
              onChange={(event) => set("display_name", event.target.value)}
            />
          </Field>

          <Field label="Monthly publishing goal" hint="Pieces per month, tracked on your dashboard.">
            <Input
              className="rounded-xl"
              type="number"
              min={1}
              placeholder="e.g. 12"
              value={form.monthly_goal}
              onChange={(event) => set("monthly_goal", event.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Logo"
          hint="Shown in the sidebar and as the browser tab icon. A square image works best."
        >
          <LogoUpload value={form.logo_url} onChange={(value) => set("logo_url", value)} />
        </Field>
      </SettingsCard>

      <SettingsCard
        title="Your platforms"
        description="The channels you publish to. These appear as options when creating content."
      >
        <PlatformPicker
          value={form.platforms}
          onChange={(value) => set("platforms", value)}
        />

        <div className="flex justify-end border-t border-border/70 pt-5">
          <Button
            type="submit"
            disabled={save.isPending}
            className="rounded-full shadow-lg shadow-primary/30"
          >
            {save.isPending ? <Loader2 className="animate-spin" /> : justSaved ? <Check /> : null}
            {justSaved ? "Saved" : "Save changes"}
          </Button>
        </div>
      </SettingsCard>
    </form>
  );
}