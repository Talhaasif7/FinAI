import { useState, useEffect } from "react";
import { Newspaper, Loader2, Sparkles, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface WeeklyReport {
  title: string;
  summary: string;
  total_spent: number;
  top_category: string;
  top_category_amount: number;
  highlights: { emoji: string; text: string }[];
  tip: string;
  mood: "great" | "good" | "okay" | "needs_work";
}

const moodEmojis: Record<string, string> = {
  great: "🟢",
  good: "🔵",
  okay: "🟡",
  needs_work: "🔴",
};

export function WeeklyReportCard() {
  const { user, subscription } = useAuth();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchReport = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStr = weekAgo.toISOString().split("T")[0];

      const [expRes, goalRes, subRes] = await Promise.all([
        supabase.from("expenses").select("*").gte("date", weekStr),
        supabase.from("goals").select("*"),
        supabase.from("subscriptions").select("*"),
      ]);

      if (!expRes.data?.length) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("weekly-report", {
        body: {
          expenses: expRes.data,
          goals: goalRes.data || [],
          subscriptions: subRes.data || [],
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setReport(data);
    } catch {
      // Silently fail for weekly report
    } finally {
      setLoading(false);
    }
  };

  const isLocked = subscription.tier === "free";

  if (!report && !loading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender/10">
              <Newspaper className="h-5 w-5 text-lavender" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Your Money Story</p>
              <p className="text-[11px] text-muted-foreground">AI-generated weekly summary</p>
            </div>
          </div>
          {isLocked ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Pro plan
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={fetchReport} disabled={loading} className="gap-1.5 text-xs">
              <Sparkles className="h-3 w-3" /> Generate
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card p-5 flex items-center gap-3">
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Writing your money story...</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="glass-card p-5 glow-lavender">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender/10">
          <Newspaper className="h-5 w-5 text-lavender" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{report.title}</p>
          <p className="text-[11px] text-muted-foreground">
            {moodEmojis[report.mood]} Week mood: {report.mood.replace("_", " ")} · ${report.total_spent.toFixed(0)} spent
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{report.summary}</p>

      {expanded && (
        <>
          <div className="space-y-1.5 mb-3">
            {report.highlights.map((h, i) => (
              <p key={i} className="text-sm text-foreground">
                <span className="mr-1.5">{h.emoji}</span>{h.text}
              </p>
            ))}
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="text-xs text-primary font-medium">💡 Tip: {report.tip}</p>
          </div>
        </>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-primary font-medium mt-2 hover:underline"
      >
        {expanded ? "Show less" : "Read full report →"}
      </button>
    </div>
  );
}
