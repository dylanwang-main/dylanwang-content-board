import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Logo from "@/components/Logo";
import MobileTab from "@/components/MobileTab";
import { NAV_ITEMS } from "@/lib/nav";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const PRIMARY_PATHS = ["/", "/brain", "/create", "/library"];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const primaryItems = PRIMARY_PATHS.map((path) =>
    NAV_ITEMS.find((item) => item.to === path)
  ).filter(Boolean);
  const moreItems = NAV_ITEMS.filter((item) => !PRIMARY_PATHS.includes(item.to));
  const moreActive = moreItems.some((item) => item.to === location.pathname);

  return (
    <div className="lg:hidden">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <Logo />
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-primary/15 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        {primaryItems.map((item) => (
          <MobileTab key={item.to} item={item} />
        ))}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "flex flex-col items-center gap-1 py-2 text-[10px] tracking-wide",
            moreActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
          More
        </button>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader>
            <SheetTitle className="text-left">More</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-1">
            {moreItems.map(({ to, label, icon: Icon }) => (
              <button
                key={to}
                type="button"
                onClick={() => {
                  navigate(to);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-sm",
                  location.pathname === to
                    ? "font-semibold text-primary"
                    : "font-medium text-foreground/80"
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background">
                  <Icon className="h-[15px] w-[15px]" strokeWidth={1.5} />
                </span>
                {label}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}