import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import ColorPalette from "@/components/brain/ColorPalette";
import Field from "@/components/kit/Field";
import FormSection from "@/components/kit/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveBrand } from "@/hooks/useCreatorData";
import TagInput from "@/components/kit/TagInput";

export default function BrandForm({ brand }) {
  const save = useSaveBrand();
  const [justSaved, setJustSaved] = useState(false);
  const [form, setForm] = useState({
    name: brand?.name || "",
    tagline: brand?.tagline || "",
    niche: brand?.niche || "",
    audience: brand?.audience || "",
    voice: brand?.voice || "",
    bio: brand?.bio || "",
    pillars: brand?.pillars || [],
    colors: brand?.colors || [],
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    await save.mutateAsync({ id: brand?.id, data: form });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  };

  return (
    <form onSubmit={onSubmit}>
      <FormSection title="Identity" description="How your brand introduces itself.">
        <Field label="Brand name">
          <Input value={form.name} onChange={(event) => set("name", event.target.value)} />
        </Field>
        <Field label="Tagline">
          <Input value={form.tagline} onChange={(event) => set("tagline", event.target.value)} />
        </Field>
        <Field label="Niche">
          <Input value={form.niche} onChange={(event) => set("niche", event.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Audience & voice" description="Who you speak to, and how you sound.">
        <Field label="Target audience">
          <Textarea
            className="min-h-[90px]"
            value={form.audience}
            onChange={(event) => set("audience", event.target.value)}
          />
        </Field>
        <Field label="Voice & tone">
          <Textarea
            className="min-h-[90px]"
            value={form.voice}
            onChange={(event) => set("voice", event.target.value)}
          />
        </Field>
        <Field label="Bio">
          <Textarea
            className="min-h-[110px]"
            value={form.bio}
            onChange={(event) => set("bio", event.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Content pillars"
        description="The recurring themes you create around. Used to tag and analyze content."
      >
        <TagInput
          value={form.pillars}
          onChange={(value) => set("pillars", value)}
          placeholder="Type a pillar and press Enter"
        />
      </FormSection>

      <FormSection title="Palette" description="Your brand colors.">
        <ColorPalette value={form.colors} onChange={(value) => set("colors", value)} />
      </FormSection>

      <div className="sticky bottom-20 z-30 flex justify-end pt-2">
        <Button type="submit" disabled={save.isPending} className=" shadow-sm">
          {save.isPending ? <Loader2 className="animate-spin" /> : justSaved && <Check />}
          {justSaved ? "Saved" : "Save brand"}
        </Button>
      </div>
    </form>
  );
}