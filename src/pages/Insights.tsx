import { motion } from "framer-motion";
import { Brain, TrendingUp, Lightbulb, Coffee, ShoppingBag, Utensils } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const insights = [
  {
    icon: Utensils,
    title: "Food Delivery Surge",
    description: "You spent 38% more on food delivery this month. Top merchants: Uber Eats ($120), McDonald's ($85), KFC ($60).",
    action: "Reducing by 25% saves $65/month",
    type: "warning" as const,
  },
  {
    icon: Coffee,
    title: "Daily Coffee Habit",
    description: "Your coffee purchases total $94/month across 22 transactions. That's $1,128/year.",
    action: "Brewing at home saves ~$70/month",
    type: "info" as const,
  },
  {
    icon: ShoppingBag,
    title: "Impulse Purchases Detected",
    description: "You made $380 in purchases under $30 that weren't budgeted. Most happened on weekends.",
    action: "Try a 24-hour rule before buying",
    type: "warning" as const,
  },
  {
    icon: TrendingUp,
    title: "Savings Rate Improving",
    description: "Your savings rate improved from 12% to 18% over the last 3 months. Keep it up!",
    action: "On track for emergency fund goal",
    type: "success" as const,
  },
];

const typeStyles = {
  warning: "border-l-4 border-l-secondary",
  info: "border-l-4 border-l-primary",
  success: "border-l-4 border-l-primary",
};

export default function Insights() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold text-foreground">Spending Intelligence</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-powered insights into your financial habits</p>
      </motion.div>

      {/* Financial Personality */}
      <motion.div variants={item} className="glass-card p-6 glow-teal">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Your Financial Personality</h2>
            <p className="text-xs text-muted-foreground">Based on 3 months of data</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex-1 text-center glass-card p-4">
            <p className="text-3xl mb-1">🎯</p>
            <p className="font-display text-sm font-bold gradient-text-primary">Balanced Saver</p>
            <p className="text-[11px] text-muted-foreground mt-1">You save consistently but enjoy occasional treats</p>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="text-center">
              <p className="font-display text-xl font-bold text-primary">78%</p>
              <p className="text-[11px] text-muted-foreground">Goal Probability</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold text-secondary">18%</p>
              <p className="text-[11px] text-muted-foreground">Savings Rate</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold text-foreground">$2.1k</p>
              <p className="text-[11px] text-muted-foreground">Avg Monthly Spend</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold text-lavender">4.2</p>
              <p className="text-[11px] text-muted-foreground">Months to Goal</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div variants={item} className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className={`glass-card p-5 ${typeStyles[insight.type]}`}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 shrink-0 mt-0.5">
                <insight.icon className="h-4 w-4 text-foreground" />
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
        ))}
      </motion.div>
    </motion.div>
  );
}
