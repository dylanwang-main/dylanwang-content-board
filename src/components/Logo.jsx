import React from "react";
import { Link } from "react-router-dom";

export default function Logo({ className = "" }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 leading-none ${className}`} aria-label="Content Dashboard">
      <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
      <span className="font-logo text-[20px] font-semibold tracking-tight text-foreground">Content Dashboard</span>
    </Link>
  );
}
