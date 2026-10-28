import { useEffect, useState } from "react";
import { Film } from "lucide-react";
import ContentDialog from "@/components/library/ContentDialog";
import EmptyState from "@/components/kit/EmptyState";
import PageLoader from "@/components/kit/PageLoader";
import Panel from "@/components/kit/Panel";
import PipelineBoard from "@/components/dashboard/PipelineBoard";
import YouTubeItemDialog from "@/components/youtube/YouTubeItemDialog";
import { useBrand, useContent, useMe } from "@/hooks/useCreatorData";
import { platformOptions } from "@/lib/content";

export default function YouTubePipeline({ focusId, onFocusHandled }) {
  const { data: items = [], isLoading } = useContent();
  const { data: me } = useMe();
  const { data: brand } = useBrand();
  const [selected, setSelected] = useState(null);

  const youtubeItems = items.filter(
    (item) => (item.platform || "").toLowerCase() === "youtube"
  );

  useEffect(() => {
    if (!focusId) return;
    const target = youtubeItems.find((item) => item.id === focusId);
    if (target) {
      setSelected(target);
      onFocusHandled?.();
    }
  }, [focusId, items]);

  if (isLoading) return <PageLoader />;

  if (youtubeItems.length === 0) {
    return (
      <EmptyState
        icon={Film}
        title="No YouTube videos planned yet"
        text="Generate a plan in the Create tab."
      />
    );
  }

  return (
    <>
      <Panel
        title="YouTube pipeline"
        action={<p className="text-xs text-muted-foreground">Drag cards between stages</p>}
      >
        <PipelineBoard items={youtubeItems} onOpenItem={(item) => setSelected(item)} />
      </Panel>

      {selected &&
        (selected.youtube_plan ? (
          <YouTubeItemDialog item={selected} onClose={() => setSelected(null)} />
        ) : (
          <ContentDialog
            item={selected}
            onClose={() => setSelected(null)}
            platforms={platformOptions(me)}
            pillars={brand?.pillars || []}
          />
        ))}
    </>
  );
}