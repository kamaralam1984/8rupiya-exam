"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

export function SubjectRadar({
  data,
}: { data: { subject: string; accuracy: number }[] }) {
  if (data.length < 3) return null;
  const chart = data.map((d) => ({ subject: d.subject, accuracy: Math.round(d.accuracy * 100) }));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RadarChart data={chart} outerRadius="78%">
          <PolarGrid stroke="hsl(var(--muted-foreground) / 0.25)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
            formatter={(v: any) => `${v}%`}
          />
          <Radar
            name="Accuracy"
            dataKey="accuracy"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.35}
            isAnimationActive
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
