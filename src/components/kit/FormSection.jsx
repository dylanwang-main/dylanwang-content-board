import React from "react";

export default function FormSection({ title, description, children }) {
  return (
    <section className="grid gap-6 border-t border-border/60 py-10 first:border-t-0 first:pt-0 lg:grid-cols-[240px_1fr] lg:gap-12">
      <div>
        <h2 className="font-heading text-xl font-light">{title}</h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}