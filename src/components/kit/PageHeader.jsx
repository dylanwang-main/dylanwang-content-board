import React from "react";

// Compact, Linear-style page header: title, one muted line, optional actions.
export default function PageHeader({ eyebrow, title, description, action }) {
  const meta = description || eyebrow;

  return (
    <div className="-mx-4 flex flex-col gap-3 border-b border-border px-4 pb-5 sm:-mx-8 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:-mx-10 lg:px-10">
      <div className="max-w-2xl">
        <h1 className="font-heading text-2xl leading-tight text-foreground">{title}</h1>
        {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
