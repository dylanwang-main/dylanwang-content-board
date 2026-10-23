import { Link } from "react-router-dom";
import Panel from "@/components/kit/Panel";

export default function GoalCard({ count = 0, goal = 0 }) {
  const hasGoal = Number(goal) > 0;
  const pct = hasGoal ? Math.min(100, Math.round((count / goal) * 100)) : 0;

  return (
    <Panel title="Monthly goal">
      {hasGoal ? (
        <div>
          <p className="font-heading text-4xl font-light tracking-tight">
            {count}
            <span className="text-lg text-muted-foreground"> / {goal}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">pieces published this month</p>

          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-chart-2 to-primary"
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">{pct}% complete</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No goal set yet.{" "}
          <Link to="/settings" className="text-primary underline-offset-4 hover:underline">
            Set a monthly publishing goal
          </Link>{" "}
          to track your pace.
        </p>
      )}
    </Panel>
  );
}