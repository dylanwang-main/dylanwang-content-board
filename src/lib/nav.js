import {
  ChartNoAxesCombined,
  Clapperboard,
  FileSearch,
  GraduationCap,
  Home,
  Instagram,
  Music2,
  Settings2,
  TrendingUp,
  Workflow,
  Youtube,
} from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Home", short: "Home", icon: Home },
  { to: "/brain", label: "Content College AI", short: "AI", icon: GraduationCap },
  { to: "/research", label: "Content Research", short: "Research", icon: FileSearch },
  { to: "/library", label: "Content System", short: "System", icon: Workflow },
  { to: "/create", label: "Create Content", short: "Create", icon: Clapperboard },
  { to: "/instagram", label: "Instagram", short: "IG", icon: Instagram },
  { to: "/tiktok", label: "TikTok", short: "TikTok", icon: Music2 },
  { to: "/youtube", label: "YouTube", short: "YT", icon: Youtube },
  { to: "/outliers", label: "Outliers", short: "Outliers", icon: TrendingUp },
  { to: "/performance", label: "Performance", short: "Stats", icon: ChartNoAxesCombined },
  { to: "/settings", label: "Settings", short: "Settings", icon: Settings2 },
];