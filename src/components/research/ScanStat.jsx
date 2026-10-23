const compact = new Intl.NumberFormat("en", { notation: "compact" });

function formatValue(value) {
  return typeof value === "number" ? compact.format(value) : "—";
}

export default function ScanStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <p className="text-xs uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-3 font-heading text-xl">{formatValue(value)}</p>
    </div>
  );
}