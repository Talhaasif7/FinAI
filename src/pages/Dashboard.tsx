import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Wallet, Target, 
  ArrowUpRight, ArrowDownRight, Sparkles, Zap
} from "lucide-react";
import { goals, spendingByCategory, weeklySpending, expenses } from "@/lib/mock-data";
import { GoalProgressCard } from "@/components/GoalProgressCard";
import { SpendingChart } from "@/components/SpendingChart";
import { WeeklySpendingChart } from "@/components/WeeklySpendingChart";
import { GoalBarChart } from "@/components/GoalBarChart";
import { RecentTransactions } from "@/components/RecentTransactions";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const summaryCards = [
  { label: "Total Balance", value: "$12,480", change: "+2.4%", up: true, icon: Wallet, accent: "teal" },
  { label: "Monthly Savings", value: "$1,240", change: "+18%", up: true, icon: TrendingUp, accent: "gold" },
  { label: "Expenses (Mar)", value: "$2,130", change: "-5.2%", up: false, icon: TrendingDown, accent: "coral" },
  { label: "Goals Progress", value: "62%", change: "+8%", up: true, icon: Target, accent: "lavender" },
];

const accentStyles: Record<string, string> = {
  teal: "glow-teal",
  gold: "glow-gold",
  coral: "",
  lavender: "glow-lavender",
};

const accentBg: Record<string, string> = {
  teal: "bg-primary/10",
  gold: "bg-secondary/10",
  coral: "bg-coral/10",
  lavender: "bg-lavender/10",
};

const accentText: Record<string, string> = {
  teal: "text-primary",
  gold: "text-secondary",
  coral: "text-coral",
  lavender: "text-lavender",
};

const goalBarData = goals.map(g => ({ name: g.name.split(" ").slice(0, 2).join(" "), saved: g.saved, target: g.target }));

export default function Dashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Good morning! 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your financial overview for today</p>
        </div>
        <div className="glass-card px-4 py-2.5 flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
          <span className="text-xs text-muted-foreground">AI Insight:</span>
          <span className="text-xs text-foreground font-medium">You're 78% on track for Singapore!</span>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`stat-card transition-all duration-300 hover:translate-y-[-2px] ${accentStyles[card.accent]}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{card.label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentBg[card.accent]}`}>
                <card.icon className={`h-4 w-4 ${accentText[card.accent]}`} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{card.value}</p>
            <div className="flex items-center gap-1 mt-1.5">
              {card.up ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-coral" />
              )}
              <span className={`text-xs font-medium ${card.up ? "text-primary" : "text-coral"}`}>{card.change}</span>
              <span className="text-[11px] text-muted-foreground">vs last month</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <WeeklySpendingChart data={weeklySpending} />
        </motion.div>
        <motion.div variants={item}>
          <SpendingChart data={spendingByCategory} />
        </motion.div>
      </div>

      {/* Goals + Goal Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Goal Progress</h2>
            <span className="text-xs text-primary cursor-pointer hover:underline">View All →</span>
          </div>
          <div className="space-y-3">
            {goals.slice(0, 4).map((goal) => (
              <GoalProgressCard key={goal.id} goal={goal} />
            ))}
          </div>
        </motion.div>
        <motion.div variants={item}>
          <GoalBarChart data={goalBarData} />
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div variants={item}>
        <RecentTransactions expenses={expenses.slice(0, 6)} />
      </motion.div>
    </motion.div>
  );
}
