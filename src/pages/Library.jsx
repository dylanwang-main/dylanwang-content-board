import { useState } from "react";
import { Download, Library as LibraryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/kit/EmptyState";
import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import ContentDialog from "@/components/library/ContentDialog";
import ContentLibraryList from "@/components/library/ContentLibraryList";
import LibraryFilters from "@/components/library/LibraryFilters";
import { useBrand, useContent, useMe } from "@/hooks/useCreatorData";
import { platformOptions } from "@/lib/content";
import { filterItems, statusCounts, usedPlatforms } from "@/lib/library";

export default function Library() {
  const { data: items = [], isLoading } = useContent();
  const { data: me } = useMe();
  const { data: brand } = useBrand();

  const [selectedId, setSelectedId] = useState(
    () => new URLSearchParams(window.location.search).get("open")
  );
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState(false);

  const clearSelection = () => {
    setSelectedId(null);
    window.history.replaceState(null, "", "/library");
  };

  const downloadAll = async () => {
    setDownloading(true);
    for (const item of items) {
      const safe = (item.title || "untitled")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const blob = new Blob([`# ${item.title}\n\n${item.body || ""}`], {
        type: "text/markdown;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safe}.md`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    setDownloading(false);
  };

  const counts = statusCounts(items);
  const visible = filterItems(items, { status, platform, search });
  const selected = items.find((item) => item.id === selectedId) || null;

  const description = `${items.length} piece${items.length === 1 ? "" : "s"} in your library.`;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Content System"
        title="Everything you've made"
        description={isLoading ? undefined : description}
        action={
          items.length > 0 && (
            <Button
              variant="outline"
              onClick={downloadAll}
              disabled={downloading}
              className="rounded-full"
            >
              <Download />
              {downloading ? "Downloading…" : "Download all"}
            </Button>
          )
        }
      />

      {isLoading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState
          icon={LibraryIcon}
          title="Your library is empty"
          text="Every idea, draft and published piece you create will live here."
          actionLabel="Create your first piece"
          actionTo="/create"
        />
      ) : (
        <div className="space-y-6">
          <LibraryFilters
            search={search}
            onSearch={setSearch}
            platform={platform}
            onPlatform={setPlatform}
            platforms={usedPlatforms(items)}
            status={status}
            onStatus={setStatus}
            counts={counts}
          />

          <ContentLibraryList items={visible} onSelect={setSelectedId} />
        </div>
      )}

      {selected && (
        <ContentDialog
          item={selected}
          onClose={clearSelection}
          platforms={platformOptions(me)}
          pillars={brand?.pillars || []}
        />
      )}
    </div>
  );
}