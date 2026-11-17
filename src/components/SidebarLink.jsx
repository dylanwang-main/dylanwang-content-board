import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function SidebarLink({ item }) {
  const { to, label, icon: Icon } = item;

  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors",
          isActive
            ? "bg-secondary font-medium text-foreground"
            : "text-sidebar-foreground hover:bg-secondary/60 hover:text-foreground"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      {label}
    </NavLink>
  );
}
