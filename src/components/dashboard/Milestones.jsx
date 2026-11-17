import MilestoneButton from "@/components/dashboard/MilestoneButton";
import { useMe } from "@/hooks/useCreatorData";
import { useToggleMilestone } from "@/hooks/useMilestones";
import { computeMilestones } from "@/lib/milestones";

export default function Milestones({ items = [], videos = [], brainFiles = [], research = [], publishedThisMonth = 0, goal }) {
  const { data: me } = useMe();
  const overrides = me?.milestone_overrides || {};
  const toggle = useToggleMilestone(overrides);

  const milestones = computeMilestones({
    items,
    videos,
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
    <section aria-label="Milestones">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-semibold text-muted-foreground">Milestones</h2>
        <p className="font-mono text-[11px] text-muted-foreground">
          {doneCount}/{milestones.length}
        </p>
      </div>
      <div className="mb-3 h-px w-full bg-border" aria-hidden="true">
        <div className="h-px bg-primary" style={{ width: `${(doneCount / milestones.length) * 100}%` }} />
      </div>

      <div className="grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2 [&>button:last-child]:border-b-0 sm:[&>button:nth-last-child(2)]:border-b-0">
        {milestones.map((milestone) => (
          <MilestoneButton
            key={milestone.label}
            label={milestone.label}
            done={milestone.done}
            onToggle={() => toggle.mutate({ label: milestone.label, done: !milestone.done })}
          />
        ))}
      </div>

      <p className="mt-3 text-[13px] text-muted-foreground">
        {next ? (
          <>
            Next up: <span className="text-foreground">{next.label}</span>
          </>
        ) : (
          "All eight done."
        )}
      </p>
    </section>
  );
}