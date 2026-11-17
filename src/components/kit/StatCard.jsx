import React from "react";

export default function StatCard({ label, value, hint }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card px-4 py-3.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-mono text-2xl tracking-tight text-foreground">{value}</p>
      {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
