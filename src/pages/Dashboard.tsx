import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Wallet, Target, 
  ArrowUpRight, ArrowDownRight, Sparkles, Download, FileText, Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GoalProgressCard } from "@/components/GoalProgressCard";
import { SpendingChart } from "@/components/SpendingChart";
import { WeeklySpendingChart } from "@/components/WeeklySpendingChart";
import { GoalBarChart } from "@/components/GoalBarChart";
import { RecentTransactions } from "@/components/RecentTransactions";
import { SmartAlerts } from "@/components/SmartAlerts";
import { WeeklyReportCard } from "@/components/WeeklyReportCard";
import { HealthScoreWidget } from "@/components/HealthScoreWidget";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportExpensesToCSV, exportExpensesToPDF, exportDashboardPDF } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const categoryColors: Record<string, string> = {
  Food: "hsl(160, 84%, 48%)",
  Shopping: "hsl(38, 92%, 54%)",
  Transport: "hsl(265, 72%, 64%)",
  Entertainment: "hsl(328, 72%, 60%)",
  Bills: "hsl(188, 92%, 52%)",
  Health: "hsl(160, 84%, 36%)",
  Other: "hsl(225, 10%, 44%)",
};

export default function Dashboard() {
  const { user, subscription } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("goals").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setGoals((data || []).map(g => ({ ...g, target: Number(g.target), saved: Number(g.saved) })));
    });
    supabase.from("expenses").select("*").order("date", { ascending: false }).then(({ data }) => {
      const mapped = (data || []).map(e => ({ ...e, amount: Number(e.amount) }));
      setAllExpenses(mapped);
      setExpenses(mapped.slice(0, 6));
    });
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      setProfile(data);
    });
  }, [user]);

  const totalExpenses = allExpenses.reduce((s, e) => s + e.amount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const goalPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const spendingByCategory = Object.entries(
    allExpenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  ).map(([category, amount]) => ({
    category,
    amount: Math.round(amount as number),
    color: categoryColors[category] || categoryColors.Other,
  })).sort((a, b) => b.amount - a.amount);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weeklySpending = dayNames.map((day, i) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);
    const dateStr = dayDate.toISOString().split("T")[0];
    const dayTotal = allExpenses
      .filter(e => e.date === dateStr)
      .reduce((s, e) => s + e.amount, 0);
    return { day, amount: Math.round(dayTotal) };
  });

  const summaryCards = [
    { label: "Total Saved", value: `$${totalSaved.toLocaleString()}`, change: "+2.4%", up: true, icon: Wallet, glow: "glow-green" },
    { label: "Active Goals", value: `${goals.length}`, change: `${goalPct}%`, up: true, icon: Target, glow: "glow-purple" },
    { label: "Total Expenses", value: `$${totalExpenses.toLocaleString()}`, change: `${allExpenses.length} txns`, up: false, icon: TrendingDown, glow: "glow-gold" },
    { label: "Goals Progress", value: `${goalPct}%`, change: `$${totalSaved.toLocaleString()} saved`, up: true, icon: TrendingUp, glow: "glow-purple" },
  ];

  const goalBarData = goals.map(g => ({ name: g.name.split(" ").slice(0, 2).join(" "), saved: g.saved, target: g.target }));
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "there";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 max-w-7xl">
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome, <span className="gradient-text-primary">{displayName}</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Here's your financial overview</p>
        </div>
        {goalPct > 0 && (
          <div className="neon-card px-3.5 py-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] text-foreground font-medium">You're {goalPct}% toward your goals!</span>
          </div>
        )}
      </motion.div>

      <motion.div variants={item}>
        <SmartAlerts />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card) => (
          <div key={card.label} className={`stat-card ${card.glow}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{card.label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <card.icon className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <p className="font-display text-xl font-bold text-foreground">{card.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {card.up ? <ArrowUpRight className="h-3 w-3 text-primary" /> : <ArrowDownRight className="h-3 w-3 text-amber" />}
              <span className={`text-[11px] font-medium ${card.up ? "text-primary" : "text-amber"}`}>{card.change}</span>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={item}>
        <WeeklyReportCard />
      </motion.div>

      {/* Health Score Widget */}
      <motion.div variants={item}>
        <HealthScoreWidget />
      </motion.div>

      {(spendingByCategory.length > 0 || weeklySpending.some(w => w.amount > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div variants={item} className="lg:col-span-2"><WeeklySpendingChart data={weeklySpending} /></motion.div>
          <motion.div variants={item}><SpendingChart data={spendingByCategory} /></motion.div>
        </div>
      )}

      {goals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div variants={item} className="glass-card p-5">
            <h2 className="font-display text-base font-semibold text-foreground mb-3">Goal Progress</h2>
            <div className="space-y-2.5">
              {goals.slice(0, 4).map((goal) => <GoalProgressCard key={goal.id} goal={goal} />)}
            </div>
          </motion.div>
          <motion.div variants={item}><GoalBarChart data={goalBarData} /></motion.div>
        </div>
      )}

      {expenses.length > 0 && (
        <motion.div variants={item}><RecentTransactions expenses={expenses} /></motion.div>
      )}

      {allExpenses.length === 0 && goals.length === 0 && (
        <motion.div variants={item} className="neon-card p-10 text-center">
          <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary/40" />
          <h2 className="font-display text-base font-semibold text-foreground mb-1.5">Welcome to FinAI!</h2>
          <p className="text-sm text-muted-foreground">Start by adding your first expense or creating a financial goal.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
