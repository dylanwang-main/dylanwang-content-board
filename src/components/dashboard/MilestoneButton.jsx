import { Check } from "lucide-react";

export default function MilestoneButton({ label, done, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
        done ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/40"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 group-hover:border-primary"
        }`}
      >
        {done && <Check className="h-3 w-3" />}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}