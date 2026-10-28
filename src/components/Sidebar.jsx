import React from "react";
import Logo from "@/components/Logo";
import SidebarLink from "@/components/SidebarLink";
import { NAV_ITEMS } from "@/lib/nav";

export default function Sidebar() {
  const mainItems = NAV_ITEMS.filter((item) => item.to !== "/settings");
  const settingsItem = NAV_ITEMS.find((item) => item.to === "/settings");

  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 lg:flex">
      <Logo />

      <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
        {mainItems.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>

      <div className="mt-auto border-t border-sidebar-border pt-3">
        <SidebarLink item={settingsItem} />
      </div>
    </aside>
  );
}