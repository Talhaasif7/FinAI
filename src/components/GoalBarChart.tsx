import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface GoalData {
  name: string;
  saved: number;
  target: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-xs text-primary">Saved: ${payload[0]?.value?.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">Target: ${payload[1]?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function GoalBarChart({ data }: { data: GoalData[] }) {
  return (
    <div className="glass-card p-5">
      <h2 className="font-display text-lg font-semibold text-foreground mb-4">Goal Comparison</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4}>
          <defs>
            <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(174, 72%, 46%)" />
              <stop offset="100%" stopColor="hsl(174, 72%, 36%)" />
            </linearGradient>
            <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(220, 15%, 22%)" />
              <stop offset="100%" stopColor="hsl(220, 15%, 16%)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(215, 15%, 50%)' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(215, 15%, 50%)' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="saved" fill="url(#savedGrad)" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="target" fill="url(#targetGrad)" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
          <span className="text-muted-foreground">Saved</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="h-2.5 w-2.5 rounded-sm bg-muted" />
          <span className="text-muted-foreground">Target</span>
        </div>
      </div>
    </div>
  );
}
