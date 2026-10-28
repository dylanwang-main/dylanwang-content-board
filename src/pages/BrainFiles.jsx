import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/kit/PageHeader";
import BrainFileRow from "@/components/brainFiles/BrainFileRow";
import { brainDocs } from "@/lib/brainDocs";
import { downloadPdf } from "@/lib/pdf";

export default function BrainFiles() {
  const downloadAll = async () => {
    for (const doc of brainDocs) {
      downloadPdf(doc.title, doc.body);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Brand Brain"
        title="Your 7 brain files"
        description="Download each PDF, then upload it to the matching section of your Content College AI Brain."
        action={
          <Button onClick={downloadAll} className="rounded-full">
            <Download />
            Download all 7
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/70">
        {brainDocs.map((doc, index) => (
          <BrainFileRow key={doc.id} doc={doc} index={index} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Upload them in this order. Brand Brain files are not content pieces, so they never appear in
        Content System.
      </p>
    </div>
  );
}