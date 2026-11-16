import CopyTitleButton from "@/components/youtube/CopyTitleButton";
import Panel from "@/components/kit/Panel";
import { formatNumber } from "@/lib/content";

function Label({ children }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  );
}

function Bullets({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export default function PlanSections({ plan }) {
  if (!plan) return null;

  const titles = plan.title_options || [];
  const opening = plan.opening || {};
  const steps = plan.plan || [];
  const thumbnails = plan.thumbnails || [];
  const competitors = plan.competitors || [];

  return (
    <div className="space-y-6">
      <Panel>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">Topic</p>
        <h3 className="mt-2 font-heading text-3xl font-light tracking-tight">
          {titles[0] || plan.working_title || plan.topic}
        </h3>
        {plan.topic && <p className="mt-3 text-sm text-muted-foreground">{plan.topic}</p>}
        {plan.idea && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.idea}</p>}
        {plan.standout_strategy && (
          <div className="mt-5 border-t border-border/70 pt-4">
            <Label>How you stand out</Label>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{plan.standout_strategy}</p>
          </div>
        )}
      </Panel>

      {titles.length > 0 && (
        <Panel title="Title options">
          <ol className="space-y-2">
            {titles.map((title, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-xl border border-border/60 px-3 py-2.5"
              >
                <span className="mt-0.5 font-heading text-sm text-muted-foreground">{index + 1}</span>
                <span className="flex-1 text-sm leading-relaxed">{title}</span>
                <CopyTitleButton value={title} />
              </li>
            ))}
          </ol>
        </Panel>
      )}

      <Panel title="Opening">
        <div className="space-y-4">
          <div>
            <Label>Problem</Label>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{opening.problem || "—"}</p>
          </div>
          <div>
            <Label>Why it matters</Label>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
              {opening.why_it_matters || "—"}
            </p>
          </div>
          <div>
            <Label>What they get</Label>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
              {opening.what_they_get || "—"}
            </p>
          </div>
        </div>

        {(plan.proof || []).length > 0 && (
          <div className="mt-5 border-t border-border/70 pt-4">
            <Label>Proof</Label>
            <Bullets items={plan.proof} />
          </div>
        )}
      </Panel>

      {steps.length > 0 && (
        <Panel title="Script plan">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="rounded-xl border border-border/60 p-4">
                <p className="text-sm font-medium">{step.step}</p>
                <Bullets items={step.points} />
              </div>
            ))}
          </div>

          {plan.payoff && (
            <div className="mt-5 border-t border-border/70 pt-4">
              <Label>Payoff</Label>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{plan.payoff}</p>
            </div>
          )}

          {(plan.pattern_interrupts || []).length > 0 && (
            <div className="mt-4">
              <Label>Pattern interrupts</Label>
              <Bullets items={plan.pattern_interrupts} />
            </div>
          )}
        </Panel>
      )}

      {thumbnails.length > 0 && (
        <Panel title="Thumbnail ideas">
          <div className="grid gap-3 sm:grid-cols-3">
            {thumbnails.map((thumb, index) => (
              <div key={index} className="rounded-xl border border-border/60 p-4">
                <p className="text-sm leading-relaxed">{thumb.concept}</p>
                {thumb.text_overlay && (
                  <span className="mt-3 inline-flex rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                    {thumb.text_overlay}
                  </span>
                )}
                {thumb.visual_direction && (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {thumb.visual_direction}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Competitors">
        {competitors.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No competitor data. Add a YouTube Data API key in Settings to include competitor research.
          </p>
        ) : (
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={competitor.video_id || index} className="flex gap-3">
                {competitor.thumbnail_url && (
                  <img
                    src={competitor.thumbnail_url}
                    alt=""
                    className="h-16 w-28 shrink-0 rounded-lg object-cover"
                    loading="lazy"
                  />
                )}
                <div className="min-w-0">
                  <a
                    href={competitor.url}
                    target="_blank"
                    rel="noreferrer"
                    className="line-clamp-2 text-sm font-medium hover:text-primary"
                  >
                    {competitor.title}
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[competitor.channel, `${formatNumber(competitor.views)} views`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {competitor.why_it_works && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {competitor.why_it_works}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Description and tags">
        <Label>Description</Label>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {plan.description || "—"}
        </p>

        {(plan.tags || []).length > 0 && (
          <div className="mt-5">
            <Label>Tags</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {plan.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] text-accent-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {(plan.clip_ideas || []).length > 0 && (
          <div className="mt-5 border-t border-border/70 pt-4">
            <Label>Clip ideas</Label>
            <Bullets items={plan.clip_ideas} />
          </div>
        )}
      </Panel>
    </div>
  );
}