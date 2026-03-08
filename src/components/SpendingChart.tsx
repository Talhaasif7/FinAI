import { categoryIcons } from "@/lib/mock-data";

interface SpendingData {
  category: string;
  amount: number;
  color: string;
}

export function SpendingChart({ data }: { data: SpendingData[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="glass-card p-5 h-full">
      <h2 className="font-display text-lg font-semibold text-foreground mb-4">Spending Breakdown</h2>
      <div className="space-y-3">
        {data.map((item) => {
          const pct = Math.round((item.amount / total) * 100);
          return (
            <div key={item.category}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <span>{categoryIcons[item.category] || "📦"}</span>
                  <span className="text-foreground font-medium">{item.category}</span>
                </div>
                <span className="text-muted-foreground">${item.amount}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-display text-lg font-bold text-foreground">${total.toLocaleString()}</span>
      </div>
    </div>
  );
}
