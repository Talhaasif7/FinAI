import { DollarSign } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  category: string;
  priority: string;
  icon: string;
}

const priorityColors: Record<string, string> = {
  high: "text-coral",
  medium: "text-secondary",
  low: "text-muted-foreground",
};

export function GoalProgressCard({ goal, onAddFunds }: { goal: Goal; onAddFunds?: () => void }) {
  const pct = Math.round((goal.saved / goal.target) * 100);
  const remaining = goal.target - goal.saved;
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="rounded-lg bg-muted/20 border border-border/50 p-4 hover:border-primary/20 transition-all duration-300 hover:translate-y-[-1px] group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{goal.icon}</span>
          <span className="text-sm font-semibold text-foreground">{goal.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-semibold tracking-wider ${priorityColors[goal.priority] || "text-muted-foreground"}`}>
            {goal.priority}
          </span>
          {onAddFunds && (
            <button
              onClick={onAddFunds}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 hover:bg-primary/20 text-primary"
              title="Add funds"
            >
              <DollarSign className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-baseline gap-1 mb-2.5">
        <span className="font-display text-lg font-bold text-foreground">${goal.saved.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">/ ${goal.target.toLocaleString()}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: pct >= 75 ? "var(--gradient-success)" : "var(--gradient-primary)",
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>${remaining.toLocaleString()} left</span>
        <span>{daysLeft} days remaining</span>
      </div>
    </div>
  );
}
