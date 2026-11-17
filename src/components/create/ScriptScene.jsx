import { Fragment } from "react";

export default function ScriptScene({ scene, number }) {
  const data = scene || {};
  const heading = data.section ? `Scene ${number} · ${data.section}` : `Scene ${number}`;

  const rows = [
    { label: "Visual", value: data.visual, tone: "" },
    { label: "Say", value: data.voiceover, tone: "leading-relaxed" },
    { label: "On screen", value: data.on_screen_text, tone: "text-primary" },
  ].filter((row) => row.value);

  return (
    <div className="rounded-lg bg-background/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">
          {heading}
        </p>

        {data.duration && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {data.duration}
          </span>
        )}
      </div>

      {rows.length > 0 && (
        <div className="mt-3 grid gap-3 sm:grid-cols-[110px_1fr]">
          {rows.map((row) => (
            <Fragment key={row.label}>
              <p className="text-xs text-muted-foreground">
                {row.label}
              </p>
              <p className={`text-sm ${row.tone}`}>{row.value}</p>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}