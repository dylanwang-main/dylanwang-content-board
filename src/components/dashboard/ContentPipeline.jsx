import { useState } from "react";
import FieldSelect from "@/components/kit/FieldSelect";
import PipelineBoard from "@/components/dashboard/PipelineBoard";

export default function ContentPipeline({ items = [], onOpenItem }) {
  const [platform, setPlatform] = useState("all");

  const platforms = [];
  items.forEach((item) => {
    const name = item.platform;
    if (!name) return;
    if (!platforms.some((known) => known.toLowerCase() === name.toLowerCase())) {
      platforms.push(name);
    }
  });
  platforms.sort((a, b) => a.localeCompare(b));

  const visibleItems =
    platform === "all"
      ? items
      : items.filter((item) => (item.platform || "").toLowerCase() === platform.toLowerCase());

  return (
    <section aria-label="Pipeline">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold text-muted-foreground">Pipeline</h2>
          <p className="mt-0.5 text-xs text-muted-foreground/80">Drag cards between stages</p>
        </div>
        <div className="w-44">
        <FieldSelect
          label="Platform"
          value={platform}
          onChange={setPlatform}
          options={[
            { value: "all", label: "All platforms" },
            ...platforms.map((name) => ({ value: name, label: name })),
          ]}
        />
        </div>
      </div>

      <PipelineBoard items={visibleItems} onOpenItem={onOpenItem} />
    </section>
  );
}