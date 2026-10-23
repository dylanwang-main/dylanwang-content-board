import React from "react";
import Logo from "@/components/Logo";
import MobileTab from "@/components/MobileTab";
import { NAV_ITEMS } from "@/lib/nav";

export default function MobileNav() {
  return (
    <div className="lg:hidden">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <Logo />
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-7 border-t border-primary/15 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        {NAV_ITEMS.map((item) => (
          <MobileTab key={item.to} item={item} />
        ))}
      </nav>
    </div>
  );
}