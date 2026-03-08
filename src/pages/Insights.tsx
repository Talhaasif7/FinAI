import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Lightbulb, Utensils, Coffee, ShoppingBag, AlertTriangle, Zap, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const typeStyles = {
  warning: "border-l-4 border-l-secondary",
  info: "border-l-4 border-l-primary",
  success: "border-l-4 border-l-primary",
};

const iconMap: Record<string, any> = {
  utensils: Utensils,
  coffee: Coffee,
  shopping: ShoppingBag,
  "trending-up": TrendingUp,
  alert: AlertTriangle,
  zap: Zap,
};

interface Analysis {
  personality: { type: string; emoji: string; description: string };
  stats: { goal_probability: number; savings_rate: number; avg_monthly_spend: number; months_to_goal: number };
  insights: { title: string; description: string; action: string; type: "warning" | "info" | "success"; icon: string }[];
  forecast: { monthly_projection: { month: string; projected_savings: number; projected_spending: number }[] };
}

export default function Insights() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);

  const fetchAnalysis = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [expRes, goalRes, subRes, budRes] = await Promise.all([
        supabase.from("expenses").select("*").order("date", { ascending: false }),
        supabase.from("goals").select("*"),
        supabase.from("subscriptions").select("*"),
        supabase.from("budgets").select("*"),
      ]);

      const expenses = expRes.data || [];
      if (expenses.length === 0) {
        setHasData(false);
        setLoading(false);
        return;
      }
      setHasData(true);

      const { data, error } = await supabase.functions.invoke("analyze-spending", {
        body: {
          expenses: expenses.slice(0, 200),
          goals: goalRes.data || [],
          subscriptions: subRes.data || [],
          budgets: budRes.data || [],
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAnalysis();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">AI is analyzing your finances...</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Spending Intelligence</h1>
          <p className="text-muted-foreground text-sm mt-1">AI-powered insights into your financial habits</p>
        </div>
        <div className="glass-card p-10 text-center">
          <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">Add some expenses first, then come back for AI-powered insights!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Spending Intelligence</h1>
          <p className="text-muted-foreground text-sm mt-1">AI-powered insights into your financial habits</p>
        </div>
        <Button variant="outline" onClick={fetchAnalysis} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </motion.div>

      {analysis && (
        <>
          {/* Financial Personality */}
          <motion.div variants={item} className="glass-card p-6 glow-teal">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Your Financial Personality</h2>
                <p className="text-xs text-muted-foreground">Based on your spending data</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
              <div className="flex-1 text-center glass-card p-4">
                <p className="text-3xl mb-1">{analysis.personality.emoji}</p>
                <p className="font-display text-sm font-bold gradient-text-primary">{analysis.personality.type}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{analysis.personality.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-primary">{analysis.stats.goal_probability}%</p>
                  <p className="text-[11px] text-muted-foreground">Goal Probability</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-secondary">{analysis.stats.savings_rate}%</p>
                  <p className="text-[11px] text-muted-foreground">Savings Rate</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-foreground">${analysis.stats.avg_monthly_spend.toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground">Avg Monthly Spend</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-lavender">{analysis.stats.months_to_goal}</p>
                  <p className="text-[11px] text-muted-foreground">Months to Goal</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Forecast Chart */}
          {analysis.forecast?.monthly_projection?.length > 0 && (
            <motion.div variants={item} className="glass-card p-5">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">📈 Financial Forecast</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analysis.forecast.monthly_projection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="projected_savings" name="Savings" fill="hsl(174, 72%, 46%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="projected_spending" name="Spending" fill="hsl(38, 95%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Insights */}
          <motion.div variants={item} className="space-y-3">
            {analysis.insights.map((insight, i) => {
              const IconComp = iconMap[insight.icon] || Lightbulb;
              return (
                <div key={i} className={`glass-card p-5 ${typeStyles[insight.type]}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 shrink-0 mt-0.5">
                      <IconComp className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Lightbulb className="h-3 w-3 text-primary" />
                        <span className="text-xs text-primary font-medium">{insight.action}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
