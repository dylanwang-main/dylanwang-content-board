import { useState } from "react";
import PageHeader from "@/components/kit/PageHeader";
import Panel from "@/components/kit/Panel";
import PageScannerForm from "@/components/research/PageScannerForm";
import ResearchCaption from "@/components/research/ResearchCaption";
import ResearchPane from "@/components/research/ResearchPane";
import ResearchReport from "@/components/research/ResearchReport";
import ResearchTabs from "@/components/research/ResearchTabs";
import RunHistory from "@/components/research/RunHistory";
import { useResearchList } from "@/hooks/useResearch";

const REPORT_TABS = ["insights", "avatars", "angles"];

export default function Research() {
  const { data: records = [], isLoading } = useResearchList();
  const [tab, setTab] = useState("scanner");
  const [selectedId, setSelectedId] = useState(null);

  const selected = records.find((record) => record.id === selectedId) || records[0];

  const handleSelect = (id) => {
    setSelectedId(id);
    setTab("insights");
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Content Research"
        title="Know your audience"
        description="Research your page or a competitor's to uncover customer insights, avatars and ranked angles. Your latest research feeds your Content College AI Brain."
      />

      <Panel>
        <ResearchTabs active={tab} onSelect={setTab} />

        <div className="mt-6">
          {tab === "scanner" && <PageScannerForm onStarted={handleSelect} />}

          {REPORT_TABS.includes(tab) && (
            <ResearchPane isLoading={isLoading} isEmpty={records.length === 0}>
              <div className="space-y-6">
                <ResearchCaption record={selected} />
                <ResearchReport record={selected} tab={tab} />
              </div>
            </ResearchPane>
          )}

          {tab === "history" && (
            <ResearchPane isLoading={isLoading} isEmpty={records.length === 0}>
              <RunHistory runs={records} selectedId={selected?.id} onSelect={handleSelect} />
            </ResearchPane>
          )}
        </div>
      </Panel>
    </div>
  );
}