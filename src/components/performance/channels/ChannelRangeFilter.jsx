import { Button } from "@/components/ui/button";

const RANGES = [
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
];

export default function ChannelRangeFilter({ days, onChange }) {
  return (
    <div className="flex gap-2">
      {RANGES.map((range) => (
        <Button
          key={range.days}
          type="button"
          variant={days === range.days ? "default" : "outline"}
          onClick={() => onChange(range.days)}
          className="rounded-full"
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}