import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Wallet, Target, 
  ArrowUpRight, ArrowDownRight, Sparkles, Zap
} from "lucide-react";
import { goals, spendingByCategory, weeklySpending, expenses } from "@/lib/mock-data";
import { GoalProgressCard } from "@/components/GoalProgressCard";
import { SpendingChart } from "@/components/SpendingChart";
import { RecentTransactions } from "@/components/RecentTransactions";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

const summaryCards = [
  { label: "Total Balance", value: "$12,480", change: "+2.4%", up: true, icon: Wallet, glow: "glow-blue" },
  { label: "Monthly Savings", value: "$1,240", change: "+18%", up: true, icon: TrendingUp, glow: "glow-green" },
  { label: "Expenses (Mar)", value: "$2,130", change: "-5.2%", up: false, icon: TrendingDown, glow: "glow-purple" },
  { label: "Goals Progress", value: "62%", change: "+8%", up: true, icon: Target, glow: "glow-blue" },
];

export default function Dashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Good morning! 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your financial overview for today</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
          <span className="text-xs text-muted-foreground">AI Insight:</span>
          <span className="text-xs text-foreground font-medium">You're 78% on track for Singapore!</span>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`glass-card-hover p-5 ${card.glow}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <card.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{card.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {card.up ? (
                <ArrowUpRight className="h-3 w-3 text-accent" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-accent" />
              )}
              <span className={`text-xs font-medium ${card.up ? "text-accent" : "text-accent"}`}>{card.change}</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals Progress */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Goal Progress</h2>
              <span className="text-xs text-primary cursor-pointer hover:underline">View All →</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goals.slice(0, 4).map((goal) => (
                <GoalProgressCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Spending Chart */}
        <motion.div variants={item}>
          <SpendingChart data={spendingByCategory} />
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Spending */}
        <motion.div variants={item} className="glass-card p-5">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Weekly Spending</h2>
          <div className="flex items-end gap-2 h-32">
            {weeklySpending.map((d, i) => {
              const maxAmt = Math.max(...weeklySpending.map(w => w.amount));
              const height = (d.amount / maxAmt) * 100;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">${d.amount}</span>
                  <div
                    className="w-full rounded-md transition-all duration-500"
                    style={{
                      height: `${height}%`,
                      background: i === 5 ? "var(--gradient-warning)" : "var(--gradient-primary)",
                      opacity: 0.8,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">{d.day}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-accent" />
            <span>Saturday spending is <span className="text-foreground font-medium">42% higher</span> than weekday average</span>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={item}>
          <RecentTransactions expenses={expenses.slice(0, 5)} />
        </motion.div>
      </div>
    </motion.div>
  );
}
