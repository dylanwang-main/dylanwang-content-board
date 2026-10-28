import { useState } from "react";
import { PenLine, Sparkles } from "lucide-react";
import PageHeader from "@/components/kit/PageHeader";
import ContentGenerator from "@/components/create/ContentGenerator";
import ManualContentForm from "@/components/create/ManualContentForm";
import { Button } from "@/components/ui/button";
import { useBrainFiles } from "@/hooks/useBrain";
import { useBrand, useMe } from "@/hooks/useCreatorData";

export default function Create() {
  const { data: me } = useMe();
  const { data: brand } = useBrand();
  const { data: brainFiles = [] } = useBrainFiles();

  const [params] = useState(() => new URLSearchParams(window.location.search));
  const initialStatus = params.get("status") === "idea" ? "idea" : "draft";
  const [mode, setMode] = useState(initialStatus === "idea" ? "manual" : "ai");

  const learnedCount = brainFiles.filter((file) => file.status === "learned").length;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Create Content"
        title="One click. A full video."
        description="Pick a platform and format. Your Content College AI Brain chooses the topic, shapes the idea and writes the complete video."
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "ai" ? "default" : "outline"}
          onClick={() => setMode("ai")}
          className="rounded-full"
        >
          <Sparkles />
          Generate with AI
        </Button>
        <Button
          type="button"
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => setMode("manual")}
          className="rounded-full"
        >
          <PenLine />
          Create manually
        </Button>
      </div>

      {mode === "ai" ? (
        <ContentGenerator me={me} brand={brand} learnedCount={learnedCount} />
      ) : (
        <ManualContentForm me={me} brand={brand} initialStatus={initialStatus} />
      )}
    </div>
  );
}