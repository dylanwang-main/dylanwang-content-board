import { Button } from "@/components/ui/button";

const RANGES = [
  { value: "all", label: "All content" },
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 182, label: "6 months" },
];

export default function DateRangeFilter({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {RANGES.map((range) => (
        <Button
          key={range.label}
          type="button"
          size="sm"
          variant={value === range.value ? "default" : "outline"}
          onClick={() => onChange(range.value)}
          className="rounded-full"
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}