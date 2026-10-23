import ResearchStatusCard from "@/components/research/ResearchStatusCard";
import CustomerResearchReport from "@/components/research/CustomerResearchReport";
import AvatarsReport from "@/components/research/AvatarsReport";
import AnglesReport from "@/components/research/AnglesReport";

export default function ResearchReport({ record, tab }) {
  if (!record) return null;

  if (record.status === "researching" || record.status === "failed") {
    return <ResearchStatusCard record={record} />;
  }

  if (tab === "avatars") return <AvatarsReport record={record} />;
  if (tab === "angles") return <AnglesReport record={record} />;

  return <CustomerResearchReport record={record} />;
}