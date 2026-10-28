import {
  ChartNoAxesCombined,
  Clapperboard,
  FileSearch,
  GraduationCap,
  Home,
  Settings2,
  Workflow,
} from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Home", short: "Home", icon: Home },
  { to: "/brain", label: "Content College AI", short: "AI", icon: GraduationCap },
  { to: "/research", label: "Content Research", short: "Research", icon: FileSearch },
  { to: "/library", label: "Content System", short: "System", icon: Workflow },
  { to: "/create", label: "Create Content", short: "Create", icon: Clapperboard },
  { to: "/performance", label: "Performance", short: "Stats", icon: ChartNoAxesCombined },
  { to: "/settings", label: "Settings", short: "Settings", icon: Settings2 },
];