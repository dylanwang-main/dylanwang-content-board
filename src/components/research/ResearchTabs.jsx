const TABS = [
  { key: "scanner", label: "Page scanner" },
  { key: "content", label: "Content scanner" },
  { key: "insights", label: "Customer research" },
  { key: "avatars", label: "Avatars" },
  { key: "angles", label: "Angles" },
  { key: "history", label: "Past runs" },
];

export default function ResearchTabs({ active, onSelect }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex gap-1 rounded-full border border-border/60 bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelect(tab.key)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === tab.key
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}