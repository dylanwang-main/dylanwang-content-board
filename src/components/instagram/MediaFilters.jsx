import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MEDIA_SORT_OPTIONS, MEDIA_TYPE_OPTIONS } from "@/lib/mediaFilters";

// Search box, Reels / Posts toggle and sort menu for the Instagram grid.
export default function MediaFilters({ value, onChange, shown, total }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const active = value.query || value.type !== "all";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="Search captions…"
            className="rounded-lg pl-9 pr-9"
          />
          {value.query && (
            <button
              type="button"
              onClick={() => set({ query: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="inline-flex shrink-0 rounded-full border border-border bg-muted/40 p-1">
          {MEDIA_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set({ type: opt.value })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                value.type === opt.value ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => set({ hideTrials: !value.hideTrials })}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            value.hideTrials ? "border-primary/40 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {value.hideTrials ? "Trials hidden" : "Trials shown"}
        </button>

        <Select value={value.sort} onValueChange={(sort) => set({ sort })}>
          <SelectTrigger className="w-full rounded-lg sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEDIA_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {shown} of {total} posts
        {active && (
          <>
            {" · "}
            <button
              type="button"
              onClick={() => set({ query: "", type: "all" })}
              className="text-primary hover:underline"
            >
              Clear filters
            </button>
          </>
        )}
      </p>
    </div>
  );
}
