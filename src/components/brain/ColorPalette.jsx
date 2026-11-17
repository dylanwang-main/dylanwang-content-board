import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ColorPalette({ value = [], onChange }) {
  const [picked, setPicked] = useState("#2F5D46");

  const add = () => {
    const color = picked.toUpperCase();
    if (!value.some((item) => item.toUpperCase() === color)) onChange([...value, color]);
  };

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((color) => (
            <div key={color} className="w-16">
              <div
                className="group relative h-16 w-16 rounded-xl ring-1 ring-border/60"
                style={{ backgroundColor: color }}
              >
                <button
                  type="button"
                  aria-label={`Remove ${color}`}
                  onClick={() => onChange(value.filter((item) => item !== color))}
                  className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-background text-muted-foreground shadow ring-1 ring-border/60 group-hover:flex"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {color}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-3">
        <input
          type="color"
          value={picked}
          onChange={(event) => setPicked(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-border/60 bg-transparent p-0.5"
        />
        <Button type="button" variant="ghost" size="sm" onClick={add}>
          <Plus />
          Add
        </Button>
      </div>
    </div>
  );
}