import { useState } from "react";
import PageLoader from "@/components/kit/PageLoader";
import ContentScannerForm from "@/components/research/ContentScannerForm";
import ContentScanList from "@/components/research/ContentScanList";
import ContentScanReport from "@/components/research/ContentScanReport";
import { useContentScans } from "@/hooks/useContentScans";

export default function ContentScannerTab() {
  const { data: scans = [], isLoading } = useContentScans();
  const [selectedId, setSelectedId] = useState(null);

  const selected = scans.find((scan) => scan.id === selectedId) || scans[0];

  return (
    <div className="space-y-6">
      <ContentScannerForm onStarted={setSelectedId} />

      {isLoading ? (
        <PageLoader />
      ) : (
        scans.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <ContentScanList scans={scans} selectedId={selected?.id} onSelect={setSelectedId} />
            <ContentScanReport scan={selected} />
          </div>
        )
      )}
    </div>
  );
}