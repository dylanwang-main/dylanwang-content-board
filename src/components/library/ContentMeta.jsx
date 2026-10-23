import Field from "@/components/kit/Field";
import FieldSelect from "@/components/kit/FieldSelect";
import { Input } from "@/components/ui/input";
import { FORMATS, STATUSES } from "@/lib/content";

function withValue(options, value) {
  const list = (options || []).filter(Boolean);
  return value && !list.includes(value) ? [...list, value] : list;
}

export default function ContentMeta({ values, onChange, platforms, pillars }) {
  const platformOptions = withValue(platforms, values.platform);
  const pillarOptions = withValue(pillars, values.pillar);

  return (
    <div className="space-y-5 rounded-2xl border border-border/60 bg-card/70 p-4 sm:p-6">
      <FieldSelect
        label="Status"
        value={values.status}
        onChange={(value) => onChange("status", value)}
        options={STATUSES}
      />

      <FieldSelect
        label="Platform"
        value={values.platform}
        onChange={(value) => onChange("platform", value)}
        options={platformOptions}
      />

      <FieldSelect
        label="Format"
        value={values.format}
        onChange={(value) => onChange("format", value)}
        options={FORMATS}
      />

      {pillarOptions.length > 0 ? (
        <FieldSelect
          label="Content pillar"
          value={values.pillar}
          onChange={(value) => onChange("pillar", value)}
          options={pillarOptions}
        />
      ) : (
        <Field label="Content pillar">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Add content pillars in My Brand to tag pieces by theme.
          </p>
        </Field>
      )}

      {values.status === "scheduled" && (
        <Field label="Scheduled for">
          <Input
            type="date"
            value={values.scheduled_date}
            onChange={(event) => onChange("scheduled_date", event.target.value)}
          />
        </Field>
      )}
    </div>
  );
}