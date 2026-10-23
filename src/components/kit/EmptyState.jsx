import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function EmptyState({ icon: Icon, title, text, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      {Icon && (
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
          <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-heading text-2xl font-light">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{text}</p>
      {actionTo && (
        <Button asChild className="mt-6 rounded-full">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}