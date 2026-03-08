import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, TrendingUp, Target, Wallet, CreditCard, 
  Lightbulb, ArrowRight, RefreshCw, Sparkles
} from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface HealthScoreData {
  score: number;
  label: string;
  color: string;
  emoji: string;
  breakdown: {
    savings: number;
    budgeting: number;
    consistency: number;
    subscriptions: number;
    goals: number;
  };
  factors: string[];
  tips: string[];
  dataPoints: {
    totalExpenses: number;
    activeGoals: number;
    budgetsSet: number;
    subscriptions: number;
  };
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const breakdownLabels: Record<string, { label: string; icon: React.ElementType; gradient: string }> = {
  savings: { label: "Savings Rate", icon: Target, gradient: "var(--gradient-primary)" },
  budgeting: { label: "Budget Adherence", icon: Wallet, gradient: "var(--gradient-success)" },
  consistency: { label: "Spending Consistency", icon: Activity, gradient: "var(--gradient-purple)" },
  subscriptions: { label: "Subscription Management", icon: CreditCard, gradient: "var(--gradient-gold)" },
  goals: { label: "Goal Progress", icon: TrendingUp, gradient: "var(--gradient-primary)" },
};

export default function FinancialHealth() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<HealthScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealthScore = async () => {
    if (!user) return;
    
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

      if (!response.ok) throw new Error("Failed to fetch health score");
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching health score:", error);
      toast({
        title: "Error",
        description: "Could not load your financial health score",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthScore();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHealthScore();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Analyzing your finances...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-card p-8 text-center max-w-md">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to calculate score</h3>
          <p className="text-muted-foreground text-sm mb-4">
            We need more data to analyze your financial health. Start by adding expenses and setting goals.
          </p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Financial Health Score
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered analysis of your financial wellness
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Main Score Card */}
      <motion.div variants={item}>
        <Card className="glass-card overflow-hidden">
          <div className="relative p-8">
            {/* Background gradient */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{ background: `linear-gradient(135deg, ${data.color}, transparent)` }}
            />
            
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              {/* Circular Score */}
              <div className="w-48 h-48 relative">
                <CircularProgressbar
                  value={data.score}
                  text={`${data.score}`}
                  styles={buildStyles({
                    textSize: "24px",
                    textColor: "hsl(var(--foreground))",
                    pathColor: data.color,
                    trailColor: "hsl(var(--muted))",
                    pathTransitionDuration: 1.5,
                  })}
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card px-3 py-1 rounded-full shadow-lg border">
                  <span className="text-lg">{data.emoji}</span>
                  <span className="text-sm font-semibold" style={{ color: data.color }}>
                    {data.label}
                  </span>
                </div>
              </div>

              {/* Score Details */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">
                  Your Financial Health is <span style={{ color: data.color }}>{data.label}</span>
                </h2>
                <p className="text-muted-foreground mb-4 max-w-lg">
                  Based on your spending patterns, savings progress, and budget adherence, 
                  we've calculated your overall financial wellness score.
                </p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Expenses Tracked", value: data.dataPoints.totalExpenses },
                    { label: "Active Goals", value: data.dataPoints.activeGoals },
                    { label: "Budgets Set", value: data.dataPoints.budgetsSet },
                    { label: "Subscriptions", value: data.dataPoints.subscriptions },
                  ].map((stat, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Score Breakdown */}
      <motion.div variants={item}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Score Breakdown
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(data.breakdown).map(([key, value]) => {
            const config = breakdownLabels[key];
            const Icon = config.icon;
            return (
              <Card key={key} className="glass-card group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: config.gradient }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-sm">{config.label}</span>
                    </div>
                    <span className="text-lg font-bold">{value}%</span>
                  </div>
                  <Progress 
                    value={value} 
                    className="h-2"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Key Factors & Tips */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Key Factors */}
        <motion.div variants={item}>
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Key Factors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.factors.map((factor, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-sm text-foreground">{factor}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Tips */}
        <motion.div variants={item}>
          <Card className="glass-card h-full border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                AI-Powered Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.tips.map((tip, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 transition-colors group cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" />
                  <span className="text-sm text-foreground">{tip}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
