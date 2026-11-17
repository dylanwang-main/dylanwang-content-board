import { Brain, ChartNoAxesCombined, FileSearch, Home, Info, Instagram, Library, LineChart, Music2, PenLine, Settings2, TrendingUp, Youtube } from "lucide-react";

// Sidebar items, in groups. The numbers come first; the writing tools sit
// below. Instagram and TikTok join "Channels" once connected (or in the demo).
export const NAV_GROUPS = [
  {
    label: null,
    items: [
      { to: "/", label: "Home", short: "Home", icon: Home },
      { to: "/analysis", label: "Analysis", short: "Analysis", icon: LineChart },
      { to: "/performance", label: "Habits & performance", short: "Habits", icon: ChartNoAxesCombined },
    ],
  },
  { label: "Channels", items: [{ to: "/youtube", label: "YouTube", short: "YouTube", icon: Youtube }] },
  {
    label: "Workspace",
    items: [
      { to: "/library", label: "Library", short: "Library", icon: Library },
      { to: "/create", label: "Create", short: "Create", icon: PenLine },
      { to: "/outliers", label: "Outliers", short: "Outliers", icon: TrendingUp },
      { to: "/brain", label: "Brain", short: "Brain", icon: Brain },
      { to: "/research", label: "Research", short: "Research", icon: FileSearch },
    ],
  },
];

export const ABOUT_ITEM = { to: "/about", label: "About this project", short: "About", icon: Info };
export const SETTINGS_ITEM = { to: "/settings", label: "Settings", short: "Settings", icon: Settings2 };

export const HIDDEN_ITEMS = [
  { to: "/instagram", label: "Instagram", short: "IG", icon: Instagram },
  { to: "/tiktok", label: "TikTok", short: "TikTok", icon: Music2 },
];

export const NAV_ITEMS = [...NAV_GROUPS.flatMap((g) => g.items), ...HIDDEN_ITEMS, ABOUT_ITEM, SETTINGS_ITEM];
