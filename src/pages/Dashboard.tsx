import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Wallet, Target, 
  ArrowUpRight, ArrowDownRight, Sparkles, Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { spendingByCategory, weeklySpending } from "@/lib/mock-data";
import { GoalProgressCard } from "@/components/GoalProgressCard";
import { SpendingChart } from "@/components/SpendingChart";
import { WeeklySpendingChart } from "@/components/WeeklySpendingChart";
import { GoalBarChart } from "@/components/GoalBarChart";
import { RecentTransactions } from "@/components/RecentTransactions";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const accentStyles: Record<string, string> = { teal: "glow-teal", gold: "glow-gold", coral: "", lavender: "glow-lavender" };
const accentBg: Record<string, string> = { teal: "bg-primary/10", gold: "bg-secondary/10", coral: "bg-coral/10", lavender: "bg-lavender/10" };
const accentText: Record<string, string> = { teal: "text-primary", gold: "text-secondary", coral: "text-coral", lavender: "text-lavender" };

export default function Dashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("goals").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setGoals((data || []).map(g => ({ ...g, target: Number(g.target), saved: Number(g.saved) })));
    });
    supabase.from("expenses").select("*").order("date", { ascending: false }).limit(6).then(({ data }) => {
      setExpenses((data || []).map(e => ({ ...e, amount: Number(e.amount) })));
    });
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      setProfile(data);
    });
  }, [user]);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const goalPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const summaryCards = [
    { label: "Total Saved", value: `$${totalSaved.toLocaleString()}`, change: "+2.4%", up: true, icon: Wallet, accent: "teal" },
    { label: "Monthly Savings", value: `$${Math.max(0, totalSaved - totalExpenses).toLocaleString()}`, change: "+18%", up: true, icon: TrendingUp, accent: "gold" },
    { label: "Expenses", value: `$${totalExpenses.toLocaleString()}`, change: "-5.2%", up: false, icon: TrendingDown, accent: "coral" },
    { label: "Goals Progress", value: `${goalPct}%`, change: "+8%", up: true, icon: Target, accent: "lavender" },
  ];

  const goalBarData = goals.map(g => ({ name: g.name.split(" ").slice(0, 2).join(" "), saved: g.saved, target: g.target }));
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "there";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Good morning, {displayName}! 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your financial overview for today</p>
        </div>
        <div className="glass-card px-4 py-2.5 flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
          <span className="text-xs text-muted-foreground">AI Insight:</span>
          <span className="text-xs text-foreground font-medium">You're {goalPct}% toward your goals!</span>
        </div>
      </motion.div>

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
              {card.up ? <ArrowUpRight className="h-3.5 w-3.5 text-primary" /> : <ArrowDownRight className="h-3.5 w-3.5 text-coral" />}
              <span className={`text-xs font-medium ${card.up ? "text-primary" : "text-coral"}`}>{card.change}</span>
              <span className="text-[11px] text-muted-foreground">vs last month</span>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2"><WeeklySpendingChart data={weeklySpending} /></motion.div>
        <motion.div variants={item}><SpendingChart data={spendingByCategory} /></motion.div>
      </div>

      {goals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Goal Progress</h2>
            </div>
            <div className="space-y-3">
              {goals.slice(0, 4).map((goal) => <GoalProgressCard key={goal.id} goal={goal} />)}
            </div>
          </motion.div>
          <motion.div variants={item}><GoalBarChart data={goalBarData} /></motion.div>
        </div>
      )}

      {expenses.length > 0 && (
        <motion.div variants={item}><RecentTransactions expenses={expenses} /></motion.div>
      )}
    </motion.div>
  );
}
