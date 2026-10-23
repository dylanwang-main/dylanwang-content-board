import PageHeader from "@/components/kit/PageHeader";
import ContentGenerator from "@/components/create/ContentGenerator";
import { useBrainFiles } from "@/hooks/useBrain";
import { useBrand, useMe } from "@/hooks/useCreatorData";

export default function Create() {
  const { data: me } = useMe();
  const { data: brand } = useBrand();
  const { data: brainFiles = [] } = useBrainFiles();

  const learnedCount = brainFiles.filter((file) => file.status === "learned").length;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Create Content"
        title="One click. A full video."
        description="Pick a platform and format. Your Content College AI Brain chooses the topic, shapes the idea and writes the complete video."
      />

      <ContentGenerator me={me} brand={brand} learnedCount={learnedCount} />
    </div>
  );
}