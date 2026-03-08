import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain, Clock, Calendar, TrendingUp, TrendingDown, Minus,
  Lightbulb, Sparkles, Moon, Sun, Sunset, Coffee, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface TimeData {
  count: number;
  total: number;
}

interface BehavioralData {
  patterns: {
    timeOfDay: Record<string, TimeData>;
    dayOfWeek: Record<string, TimeData>;
    impulseBuys: number;
    averageTransaction: number;
    largestCategory: string;
    weekendVsWeekday: { weekend: number; weekday: number };
    recentTrend: "increasing" | "decreasing" | "stable";
    spendingPersonality: string;
  };
  nudges: string[];
  insights: string[];
  totalExpenses: number;
  totalAmount: number;
}

const timeIcons: Record<string, React.ElementType> = {
  morning: Coffee,
  afternoon: Sun,
  evening: Sunset,
  night: Moon,
};

const trendConfig = {
  increasing: { icon: TrendingUp, color: "text-destructive", label: "Increasing", bg: "bg-destructive/10" },
  decreasing: { icon: TrendingDown, color: "text-primary", label: "Decreasing", bg: "bg-primary/10" },
  stable: { icon: Minus, color: "text-muted-foreground", label: "Stable", bg: "bg-muted" },
};

export default function BehavioralAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<BehavioralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalysis = async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/behavioral-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch analysis");
      const result = await response.json();
      if (result.patterns) setData(result);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not load behavioral analysis", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAnalysis(); }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalysis();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Analyzing your spending patterns...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-card p-8 text-center max-w-md">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Not Enough Data</h3>
          <p className="text-muted-foreground text-sm mb-4">
            We need more expense data to analyze your spending patterns. Start tracking your expenses!
          </p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </Card>
      </div>
    );
  }

  const { patterns, nudges, insights, totalExpenses, totalAmount } = data;
  const weekendPct = (patterns.weekendVsWeekday.weekend + patterns.weekendVsWeekday.weekday) > 0
    ? (patterns.weekendVsWeekday.weekend / (patterns.weekendVsWeekday.weekend + patterns.weekendVsWeekday.weekday)) * 100
    : 50;

  // Find peak time and day
  const peakTime = Object.entries(patterns.timeOfDay).sort((a, b) => b[1].total - a[1].total)[0];
  const peakDay = Object.entries(patterns.dayOfWeek).sort((a, b) => b[1].total - a[1].total)[0];
  const TrendIcon = trendConfig[patterns.recentTrend].icon;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-secondary" />
            Behavioral Analysis
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered insights into your spending patterns
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Personality Card */}
      <motion.div variants={item}>
        <Card className="glass-card overflow-hidden">
          <div className="relative p-6">
            <div className="absolute inset-0 opacity-10" style={{ background: "var(--gradient-purple)" }} />
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-purple)" }}>
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Your Spending Personality</p>
                <h2 className="text-3xl font-bold mb-2">{patterns.spendingPersonality}</h2>
                <p className="text-muted-foreground text-sm max-w-lg">
                  Based on {totalExpenses} transactions totaling ${totalAmount.toFixed(0)} over the last 90 days.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Peak Time */}
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/20">
                {(() => { const Icon = timeIcons[peakTime[0]]; return <Icon className="h-5 w-5 text-accent" />; })()}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Peak Spending Time</p>
                <p className="font-semibold capitalize">{peakTime[0]}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              ${peakTime[1].total.toFixed(0)} across {peakTime[1].count} purchases
            </p>
          </CardContent>
        </Card>

        {/* Peak Day */}
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Busiest Day</p>
                <p className="font-semibold">{peakDay[0]}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              ${peakDay[1].total.toFixed(0)} average spending
            </p>
          </CardContent>
        </Card>

        {/* Trend */}
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${trendConfig[patterns.recentTrend].bg}`}>
                <TrendIcon className={`h-5 w-5 ${trendConfig[patterns.recentTrend].color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recent Trend</p>
                <p className="font-semibold">{trendConfig[patterns.recentTrend].label}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Compared to 2 weeks ago
            </p>
          </CardContent>
        </Card>

        {/* Impulse Buys */}
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/20">
                <Moon className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Impulse Buys</p>
                <p className="font-semibold">{patterns.impulseBuys}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Late-night shopping/entertainment
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Time of Day & Weekend Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Time of Day */}
        <motion.div variants={item}>
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-secondary" />
                Spending by Time of Day
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(patterns.timeOfDay).map(([time, data]) => {
                const maxTotal = Math.max(...Object.values(patterns.timeOfDay).map(t => t.total));
                const pct = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;
                const Icon = timeIcons[time];
                return (
                  <div key={time}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium capitalize">{time}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ${data.total.toFixed(0)} ({data.count})
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekend vs Weekday */}
        <motion.div variants={item}>
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Weekend vs Weekday
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">${patterns.weekendVsWeekday.weekday.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Weekday</p>
                </div>
                <div className="flex-1 mx-6">
                  <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${100 - weekendPct}%` }}
                    />
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${weekendPct}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">${patterns.weekendVsWeekday.weekend.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Weekend</p>
                </div>
              </div>

              {/* Day breakdown */}
              <div className="space-y-2 mt-6">
                {Object.entries(patterns.dayOfWeek).map(([day, data]) => {
                  const maxDay = Math.max(...Object.values(patterns.dayOfWeek).map(d => d.total));
                  const pct = maxDay > 0 ? (data.total / maxDay) * 100 : 0;
                  const isWeekend = day === "Saturday" || day === "Sunday";
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <span className="text-xs w-8 text-muted-foreground">{day.slice(0, 3)}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isWeekend ? "bg-accent" : "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">${data.total.toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Nudges & Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nudges */}
        <motion.div variants={item}>
          <Card className="glass-card h-full border-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent" />
                AI Nudges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nudges.map((nudge, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 hover:bg-accent/15 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-accent">{i + 1}</span>
                  </div>
                  <span className="text-sm text-foreground">{nudge}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Deeper Insights */}
        {insights.length > 0 && (
          <motion.div variants={item}>
            <Card className="glass-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-5 w-5 text-secondary" />
                  Deeper Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-secondary/10 border border-secondary/20"
                  >
                    <p className="text-sm text-foreground">{insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
