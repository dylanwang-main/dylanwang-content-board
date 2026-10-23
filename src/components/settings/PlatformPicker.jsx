import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DEFAULT_PLATFORMS } from "@/lib/content";

export default function PlatformPicker({ value, onChange }) {
  const [draft, setDraft] = useState("");
  const selected = value || [];
  const options = [
    ...DEFAULT_PLATFORMS,
    ...selected.filter((name) => !DEFAULT_PLATFORMS.includes(name)),
  ];

  const toggle = (name) => {
    onChange(
      selected.includes(name)
        ? selected.filter((entry) => entry !== name)
        : [...selected, name]
    );
  };

  const addDraft = () => {
    const name = draft.trim();
    setDraft("");
    if (!name || selected.includes(name)) return;

    onChange([...selected, name]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((name) => {
          const active = selected.includes(name);

          return (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                active
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          addDraft();
        }}
        onBlur={addDraft}
        placeholder="Add another platform and press Enter"
      />
    </div>
  );
}