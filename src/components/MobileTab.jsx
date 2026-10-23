import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function MobileTab({ item }) {
  const { to, short, icon: Icon } = item;

  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-1 py-2 text-[10px] tracking-wide",
          isActive ? "text-primary" : "text-muted-foreground"
        )
      }
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
      {short}
    </NavLink>
  );
}