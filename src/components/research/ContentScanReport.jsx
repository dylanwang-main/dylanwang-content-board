import { ExternalLink } from "lucide-react";
import AnalyticsCard from "@/components/research/AnalyticsCard";
import CommentAnalysisCard from "@/components/research/CommentAnalysisCard";
import ScanStatusCard from "@/components/research/ScanStatusCard";
import TranscriptCard from "@/components/research/TranscriptCard";

export default function ContentScanReport({ scan }) {
  if (!scan) return null;

  if (scan.status !== "complete") return <ScanStatusCard scan={scan} />;

  const href = scan.url?.startsWith("http") ? scan.url : `https://${scan.url || ""}`;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-heading text-xl font-light tracking-tight">
          {scan.title || "Scanned content"}
        </h3>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          {`${scan.creator ? `${scan.creator} · ` : ""}${scan.platform}`}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <AnalyticsCard scan={scan} />
      <CommentAnalysisCard scan={scan} />
      <TranscriptCard scan={scan} />
    </div>
  );
}