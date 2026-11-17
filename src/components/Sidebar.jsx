import React from "react";
import Logo from "@/components/Logo";
import SidebarLink from "@/components/SidebarLink";
import { ABOUT_ITEM, HIDDEN_ITEMS, NAV_GROUPS, SETTINGS_ITEM } from "@/lib/nav";
import { useMe } from "@/hooks/useCreatorData";

export default function Sidebar() {
  const { data: me } = useMe();
  const extra = HIDDEN_ITEMS.filter(
    (item) =>
      me?.is_anonymous ||
      (item.to === "/instagram" && me?.instagram_token) ||
      (item.to === "/tiktok" && me?.tiktok_connected_at),
  );
  const groups = NAV_GROUPS.map((group) =>
    group.label === "Channels" && extra.length ? { ...group, items: [...extra, ...group.items] } : group,
  );

  return (
    <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-5 lg:flex">
      <Logo />

      <nav aria-label="Main" className="mt-7 flex flex-1 flex-col gap-5 overflow-y-auto">
        {groups.map((group, i) => (
          <div key={group.label ?? i} className="flex flex-col gap-0.5">
            {group.label && <p className="mb-1 px-2 text-[11px] font-medium text-muted-foreground">{group.label}</p>}
            {group.items.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-sidebar-border pt-3">
        <SidebarLink item={ABOUT_ITEM} />
        <SidebarLink item={SETTINGS_ITEM} />
      </div>
    </aside>
  );
}
