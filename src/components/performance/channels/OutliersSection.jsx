import { ImageOff } from "lucide-react";
import { Link } from "react-router-dom";
import Panel from "@/components/kit/Panel";

export default function OutliersSection({ outliers }) {
  return (
    <Panel
      title="Top outliers"
      action={
        <Link to="/outliers" className="text-xs text-primary hover:underline">
          View all
        </Link>
      }
    >
      {outliers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No outliers yet.{" "}
          <Link to="/outliers" className="text-primary hover:underline">
            Find outliers
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {outliers.map((outlier) => (
            <Link
              key={outlier.id}
              to="/outliers"
              className="group flex items-center gap-3"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                {outlier.thumbnail_url ? (
                  <img
                    src={outlier.thumbnail_url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                )}
              </div>

              <p className="min-w-0 flex-1 truncate text-sm font-medium transition-colors group-hover:text-primary">
                {outlier.title || "Untitled post"}
              </p>

              <span className="shrink-0 text-sm font-medium text-primary">
                {Number(outlier.engagement_score || 0).toFixed(1)}x
              </span>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}