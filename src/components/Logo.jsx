import React from "react";
import { Link } from "react-router-dom";

export default function Logo({ className = "" }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-baseline gap-[6px] leading-none ${className}`}
      aria-label="Content Dashboard"
    >
      <span className="font-logo text-[26px] leading-none text-primary">Content</span>
      <span className="font-heading text-[13px] font-semibold uppercase leading-none tracking-[0.18em] text-foreground">
        Dashboard
      </span>
    </Link>
  );
}