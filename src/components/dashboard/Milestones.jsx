import MilestoneButton from "@/components/dashboard/MilestoneButton";
import { useMe } from "@/hooks/useCreatorData";
import { useToggleMilestone } from "@/hooks/useMilestones";
import { computeMilestones } from "@/lib/milestones";

export default function Milestones({ items = [], brainFiles = [], research = [], publishedThisMonth = 0, goal }) {
  const { data: me } = useMe();
  const overrides = me?.milestone_overrides || {};
  const toggle = useToggleMilestone(overrides);

  const milestones = computeMilestones({
    items,
    brainFiles,
    research,
    publishedThisMonth,
    goal,
  }).map((milestone) => ({
    ...milestone,
    done:
      typeof overrides[milestone.label] === "boolean" ? overrides[milestone.label] : milestone.done,
  }));

  const doneCount = milestones.filter((milestone) => milestone.done).length;
  const next = milestones.find((milestone) => !milestone.done);

  return (
    <section className="rounded-lg border border-border/60 bg-card p-6 sm:p-8">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-xl font-semibold">Milestones</h2>
        <p className="text-xs text-muted-foreground">
          {doneCount}/{milestones.length} done
        </p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {milestones.map((milestone) => (
          <MilestoneButton
            key={milestone.label}
            label={milestone.label}
            done={milestone.done}
            onToggle={() => toggle.mutate({ label: milestone.label, done: !milestone.done })}
          />
        ))}
      </div>

      <p className="mt-5 text-sm">
        {next ? (
          <>
            Next up: <span className="text-primary">{next.label}</span>.
          </>
        ) : (
          "Every milestone reached. Beautiful work."
        )}
      </p>
    </section>
  );
}