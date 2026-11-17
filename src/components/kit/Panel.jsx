import React from "react";

export default function Panel({ title, action, children, className = "" }) {
  const hasHeader = Boolean(title || action);

  return (
    <section className={`rounded-lg border border-border bg-card p-5 ${className}`}>
      {hasHeader && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[13px] font-semibold text-muted-foreground">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
