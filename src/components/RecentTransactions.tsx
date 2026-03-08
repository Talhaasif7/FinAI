import { categoryIcons, type Expense } from "@/lib/mock-data";

export function RecentTransactions({ expenses }: { expenses: Expense[] }) {
  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Recent Transactions</h2>
        <span className="text-xs text-primary cursor-pointer hover:underline">View All →</span>
      </div>
      <div className="space-y-3">
        {expenses.map((exp) => (
          <div key={exp.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 text-sm">
                {categoryIcons[exp.category] || "📦"}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{exp.merchant}</p>
                <p className="text-[11px] text-muted-foreground">{exp.category} · {exp.date}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-foreground">-${exp.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
