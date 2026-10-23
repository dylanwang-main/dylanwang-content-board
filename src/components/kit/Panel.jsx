import React from "react";

export default function Panel({ title, action, children, className = "" }) {
  const hasHeader = Boolean(title || action);

  return (
    <section className={`rounded-3xl border border-border/70 bg-card p-5 shadow-lg shadow-black/20 sm:p-6 ${className}`}>
      {hasHeader && (
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-light tracking-tight">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}