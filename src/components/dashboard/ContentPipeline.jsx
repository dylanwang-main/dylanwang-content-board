import { useState } from "react";
import FieldSelect from "@/components/kit/FieldSelect";
import Panel from "@/components/kit/Panel";
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
    <Panel
      title="Content pipeline"
      action={<p className="text-xs text-muted-foreground">Drag cards between stages</p>}
    >
      <div className="mb-5 max-w-xs">
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

      <PipelineBoard items={visibleItems} onOpenItem={onOpenItem} />
    </Panel>
  );
}