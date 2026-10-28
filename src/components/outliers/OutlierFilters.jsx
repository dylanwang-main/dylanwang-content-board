const OPTIONS = [
  { key: "all", label: "All" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
];

export default function OutlierFilters({ value, onChange, counts }) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const active = value === option.key;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
            <span className="ml-2 opacity-70">{counts[option.key] || 0}</span>
          </button>
        );
      })}
    </div>
  );
}