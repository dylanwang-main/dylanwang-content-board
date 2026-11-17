export default function SectionNavButton({ section, count, active, onClick }) {
  const Icon = section.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2.5 rounded-lg border px-3.5 py-3 text-left text-sm transition-colors lg:w-full ${
        active
          ? "border-primary/40 bg-primary/5 text-primary"
          : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="whitespace-nowrap font-medium">{section.label}</span>
      {count === 0 ? (
        <span className="ml-auto text-xs text-muted-foreground/60">0</span>
      ) : (
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          {count}
        </span>
      )}
    </button>
  );
}