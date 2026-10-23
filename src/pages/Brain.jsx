import { useState } from "react";
import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import SectionNav from "@/components/brain/SectionNav";
import TrainingProgress from "@/components/brain/TrainingProgress";
import { useBrainFiles } from "@/hooks/useBrain";
import { BRAIN_SECTIONS } from "@/lib/brain";

export default function Brain() {
  const { data: files = [], isLoading } = useBrainFiles();
  const [activeSection, setActiveSection] = useState("brand");

  if (isLoading) return <PageLoader />;

  const learned = files.filter((file) => file.status === "learned");
  const trained = BRAIN_SECTIONS.filter((section) =>
    learned.some((file) => file.section === section.key)
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content College AI"
        title="Train your brain"
        description="Upload the files that make you, you. The brain reads each one and remembers what matters."
      />

      <TrainingProgress
        trained={trained}
        total={BRAIN_SECTIONS.length}
        learnedCount={learned.length}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <SectionNav files={files} activeSection={activeSection} onSelect={setActiveSection} />
        <div className="min-w-0 flex-1" />
      </div>
    </div>
  );
}