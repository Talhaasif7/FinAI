import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Activity, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface HealthScoreData {
  score: number;
  label: string;
  color: string;
  emoji: string;
}

export function HealthScoreWidget() {
  const { user } = useAuth();
  const [data, setData] = useState<HealthScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchScore = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-health-score`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setData({
            score: result.score,
            label: result.label,
            color: result.color,
            emoji: result.emoji,
          });
        }
      } catch (e) {
        console.error("Failed to fetch health score:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [user]);

  if (loading) {
    return (
      <div className="glass-card p-5 flex items-center justify-center h-[180px]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <Link to="/health" className="glass-card p-5 flex items-center gap-4 group hover:shadow-lg transition-all">
        <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center">
          <Activity className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Health Score</h3>
          <p className="text-xs text-muted-foreground">Add more data to calculate your score</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </Link>
    );
  }

  return (
    <Link to="/health" className="glass-card p-5 flex items-center gap-5 group hover:shadow-lg transition-all">
      <div className="w-20 h-20 relative">
        <CircularProgressbar
          value={data.score}
          text={`${data.score}`}
          styles={buildStyles({
            textSize: "28px",
            textColor: "hsl(var(--foreground))",
            pathColor: data.color,
            trailColor: "hsl(var(--muted))",
            pathTransitionDuration: 1,
          })}
        />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Financial Health</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: data.color }}>{data.label}</span>
          <span className="text-lg">{data.emoji}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Click to view full report</p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}
