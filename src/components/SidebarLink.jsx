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
          "group flex items-center gap-3 rounded-xl px-2 py-2 text-sm",
          isActive
            ? "font-semibold text-foreground"
            : "font-medium text-sidebar-foreground hover:text-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-sidebar-border bg-background group-hover:border-primary/40"
            )}
          >
            <Icon className="h-[15px] w-[15px]" strokeWidth={1.5} />
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
}