import React from "react";
import { Link } from "react-router-dom";

export default function Logo({ className = "" }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 px-2 leading-none ${className}`} aria-label="Content Dashboard home">
      <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
      <span className="text-sm font-semibold tracking-tight text-foreground">dylan / content</span>
    </Link>
  );
}
