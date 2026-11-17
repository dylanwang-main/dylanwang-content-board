import { Check } from "lucide-react";

// One checklist row. Click to override the computed state.
export default function MilestoneButton({ label, done, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={done}
      className="group flex items-center gap-3 border-b border-border px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-secondary/60 sm:odd:border-r"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
          done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50 group-hover:border-foreground"
        }`}
      >
        {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      <span className={done ? "text-muted-foreground line-through decoration-muted-foreground/40" : "text-foreground"}>{label}</span>
    </button>
  );
}
