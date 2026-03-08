import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { categoryIcons } from "@/lib/mock-data";

interface SpendingData {
  category: string;
  amount: number;
  color: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <p className="text-xs font-semibold text-foreground">{d.category}</p>
        <p className="text-xs text-muted-foreground">${d.amount.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function SpendingChart({ data }: { data: SpendingData[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <h2 className="font-display text-base font-semibold text-foreground mb-4">Spending Breakdown</h2>
      
      <div className="flex-1 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={78}
              paddingAngle={3}
              dataKey="amount"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="font-display text-lg font-bold text-foreground">${total.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mt-2">
        {data.map((item) => {
          const pct = Math.round((item.amount / total) * 100);
          return (
            <div key={item.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{categoryIcons[item.category] || "📦"} {item.category}</span>
              </div>
              <span className="text-foreground font-medium">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
