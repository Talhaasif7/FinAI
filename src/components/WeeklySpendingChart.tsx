import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface WeeklyData {
  day: string;
  amount: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-xs text-primary">${payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function WeeklySpendingChart({ data }: { data: WeeklyData[] }) {
  return (
    <div className="glass-card p-5">
      <h2 className="font-display text-lg font-semibold text-foreground mb-4">Weekly Spending</h2>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(215, 15%, 50%)' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(215, 15%, 50%)' }} tickFormatter={v => `$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="hsl(174, 72%, 46%)"
            strokeWidth={2.5}
            fill="url(#spendGradient)"
            dot={{ fill: "hsl(174, 72%, 46%)", strokeWidth: 0, r: 4 }}
            activeDot={{ fill: "hsl(174, 72%, 46%)", strokeWidth: 2, stroke: "hsl(220, 20%, 4%)", r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
