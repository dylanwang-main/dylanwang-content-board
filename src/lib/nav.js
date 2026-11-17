import { Brain, ChartNoAxesCombined, LineChart, FileSearch, Home, Instagram, Library, Music2, PenLine, Settings2, TrendingUp, Youtube } from "lucide-react";

// Sidebar items, in groups. Instagram and TikTok pages still exist but are
// left out of the menu while their sync is off.
export const NAV_GROUPS = [
  {
    label: null,
    items: [
      { to: "/", label: "Home", short: "Home", icon: Home },
      { to: "/library", label: "Library", short: "Library", icon: Library },
      { to: "/create", label: "Create", short: "Create", icon: PenLine },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { to: "/brain", label: "Brain", short: "Brain", icon: Brain },
      { to: "/research", label: "Research", short: "Research", icon: FileSearch },
    ],
  },
  { label: "Channels", items: [{ to: "/youtube", label: "YouTube", short: "YouTube", icon: Youtube }] },
  {
    label: "Insights",
    items: [
      { to: "/analysis", label: "Analysis", short: "Analysis", icon: LineChart },
      { to: "/outliers", label: "Outliers", short: "Outliers", icon: TrendingUp },
      { to: "/performance", label: "Performance", short: "Stats", icon: ChartNoAxesCombined },
    ],
  },
];

export const SETTINGS_ITEM = { to: "/settings", label: "Settings", short: "Settings", icon: Settings2 };

export const HIDDEN_ITEMS = [
  { to: "/instagram", label: "Instagram", short: "IG", icon: Instagram },
  { to: "/tiktok", label: "TikTok", short: "TikTok", icon: Music2 },
];

export const NAV_ITEMS = [...NAV_GROUPS.flatMap((g) => g.items), SETTINGS_ITEM];
