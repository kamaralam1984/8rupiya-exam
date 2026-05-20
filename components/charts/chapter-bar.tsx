"use client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

export function ChapterBar({
  data,
}: { data: { name: string; accuracy: number; subject: string }[] }) {
  if (data.length === 0) return null;
  const sorted = [...data].sort((a, b) => a.accuracy - b.accuracy).slice(0, 8);
  const chart = sorted.map((d) => ({ name: d.name.length > 22 ? d.name.slice(0, 20) + "…" : d.name, value: Math.round(d.accuracy * 100) }));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={chart} layout="vertical" margin={{ left: 12 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
            formatter={(v: any) => `${v}%`}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive>
            {chart.map((d, i) => (
              <Cell key={i} fill={
                d.value >= 70 ? "hsl(142 71% 45%)" :
                d.value >= 40 ? "hsl(45 93% 47%)" :
                "hsl(0 84% 60%)"
              } />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
