import BrainFileRow from "@/components/brain/BrainFileRow";
import SectionUploader from "@/components/brain/SectionUploader";
import Panel from "@/components/kit/Panel";

export default function SectionPanel({ section, files = [] }) {
  if (!section) return null;
  const Icon = section.icon;

  return (
    <Panel>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
          <Icon className="h-5 w-5 text-primary" />
        </span>
        <div>
          <h2 className="font-heading text-2xl font-light tracking-tight">{section.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
        </div>
      </div>

      <SectionUploader section={section.key} />

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <BrainFileRow key={file.id} file={file} />
          ))}
        </div>
      )}
    </Panel>
  );
}