import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES } from "@/lib/content";

const TABS = [{ value: "all", label: "All" }, ...STATUSES];

export default function LibraryFilters({
  search,
  onSearch,
  platform,
  onPlatform,
  platforms,
  status,
  onStatus,
  counts,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="rounded-xl pl-9"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search titles and copy…"
          />
        </div>

        <Select value={platform} onValueChange={onPlatform}>
          <SelectTrigger className="rounded-xl sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {platforms.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="inline-flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatus(tab.value)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                status === tab.value
                  ? "bg-gold-gradient text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label} <span className="opacity-70">{counts[tab.value] || 0}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}