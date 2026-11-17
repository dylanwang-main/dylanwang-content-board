import React from "react";

export default function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/70 min-w-0 p-4 transition-colors duration-300 hover:border-primary/30 sm:p-6">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">{label}</p>
      <p className="mt-3 font-heading text-3xl font-normal tracking-tight sm:mt-4 sm:text-4xl text-foreground">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}