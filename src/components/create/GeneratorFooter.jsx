import { Link } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GeneratorFooter({ learnedCount, isPending, disabled }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
        {learnedCount > 0 ? (
          `Using ${learnedCount} learned ${learnedCount === 1 ? "file" : "files"} from your brain`
        ) : (
          <span>
            Your brain is empty —{" "}
            <Link to="/brain" className="text-primary hover:underline">
              upload files first
            </Link>
          </span>
        )}
      </p>

      <Button type="submit" disabled={isPending || disabled}>
        {isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {isPending ? "Generating…" : "Generate"}
      </Button>
    </div>
  );
}