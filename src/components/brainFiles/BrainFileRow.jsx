import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadPdf } from "@/lib/pdf";

export default function BrainFileRow({ doc, index }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/50 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">
          {index + 1}
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">{doc.section}</p>
          <p className="text-xs text-muted-foreground">Upload to the {doc.section} section</p>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={() => downloadPdf(doc.title, doc.body)}
        className="rounded-full sm:w-auto"
      >
        <Download />
        Download PDF
      </Button>
    </div>
  );
}