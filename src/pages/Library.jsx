import { useState } from "react";
import { Library as LibraryIcon } from "lucide-react";
import EmptyState from "@/components/kit/EmptyState";
import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import ContentLibraryList from "@/components/library/ContentLibraryList";
import LibraryFilters from "@/components/library/LibraryFilters";
import { useBrand, useContent, useMe } from "@/hooks/useCreatorData";
import { filterItems, statusCounts, usedPlatforms } from "@/lib/library";

export default function Library() {
  const { data: items = [], isLoading } = useContent();
  useMe();
  useBrand();

  const [selectedId, setSelectedId] = useState(
    () => new URLSearchParams(window.location.search).get("open")
  );
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [search, setSearch] = useState("");

  const clearSelection = () => {
    setSelectedId(null);
    window.history.replaceState(null, "", "/library");
  };

  const counts = statusCounts(items);
  const visible = filterItems(items, { status, platform, search });

  const description = `${items.length} piece${items.length === 1 ? "" : "s"} in your library.`;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Content System"
        title="Everything you've made"
        description={isLoading ? undefined : description}
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
    </div>
  );
}