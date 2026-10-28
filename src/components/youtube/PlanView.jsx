import { ArrowRight } from "lucide-react";
import PlanSections from "@/components/youtube/PlanSections";
import { Button } from "@/components/ui/button";

export default function PlanView({ plan, onOpenPipeline }) {
  return (
    <div className="space-y-6">
      <PlanSections plan={plan} />

      <div className="flex justify-end">
        <Button variant="outline" className="rounded-full" onClick={onOpenPipeline}>
          Saved to pipeline, open
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}