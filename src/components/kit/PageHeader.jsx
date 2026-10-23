import React from "react";

export default function PageHeader({ eyebrow, title, description, action }) {
  const meta = [eyebrow, description].filter(Boolean).join(" — ");

  return (
    <div className="-mx-4 flex flex-col gap-4 border-b border-border/70 px-4 pb-6 sm:-mx-8 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:-mx-10 lg:px-10">
      <div className="max-w-2xl">
        <h1 className="font-heading text-2xl leading-tight text-foreground sm:text-3xl">{title}</h1>
        {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}