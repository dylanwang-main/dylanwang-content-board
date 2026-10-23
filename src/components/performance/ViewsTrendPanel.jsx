import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Panel from "@/components/kit/Panel";
import { formatNumber } from "@/lib/content";

const tick = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

export default function ViewsTrendPanel({ data }) {
  return (
    <Panel title="Views over the last 6 months">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="viewsTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tick} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={tick}
              width={44}
              tickFormatter={formatNumber}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value) => formatNumber(value)}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#viewsTrend)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}