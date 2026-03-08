import { useState, useEffect } from "react";
import { AlertTriangle, Bell, CheckCircle, CreditCard, Target, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Alert {
  id: string;
  type: "warning" | "info" | "danger";
  icon: any;
  title: string;
  description: string;
}

export function SmartAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const generate = async () => {
      const newAlerts: Alert[] = [];

      const [budgetRes, expenseRes, subRes, goalRes] = await Promise.all([
        supabase.from("budgets").select("*"),
        supabase.from("expenses").select("*"),
        supabase.from("subscriptions").select("*"),
        supabase.from("goals").select("*"),
      ]);

      const budgets = budgetRes.data || [];
      const expenses = (expenseRes.data || []).map(e => ({ ...e, amount: Number(e.amount) }));
      const subs = subRes.data || [];
      const goals = (goalRes.data || []).map(g => ({ ...g, target: Number(g.target), saved: Number(g.saved) }));

      // Budget alerts
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      budgets.forEach((b: any) => {
        const spent = expenses
          .filter(e => e.category === b.category && e.date?.startsWith(currentMonth))
          .reduce((s, e) => s + e.amount, 0);
        const limit = Number(b.monthly_limit);
        const pct = limit > 0 ? (spent / limit) * 100 : 0;
        if (pct > 100) {
          newAlerts.push({
            id: `budget-over-${b.category}`,
            type: "danger",
            icon: AlertTriangle,
            title: `${b.category} budget exceeded!`,
            description: `You've spent $${spent.toFixed(0)} of your $${limit.toFixed(0)} ${b.category} budget.`,
          });
        } else if (pct > 80) {
          newAlerts.push({
            id: `budget-warn-${b.category}`,
            type: "warning",
            icon: AlertTriangle,
            title: `${b.category} budget at ${Math.round(pct)}%`,
            description: `$${(limit - spent).toFixed(0)} remaining in your ${b.category} budget this month.`,
          });
        }
      });

      // Subscription renewal alerts (next 3 days)
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      subs.forEach((s: any) => {
        const billing = new Date(s.next_billing);
        if (billing <= threeDaysFromNow && billing >= now) {
          const daysUntil = Math.ceil((billing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          newAlerts.push({
            id: `sub-renew-${s.id}`,
            type: "info",
            icon: CreditCard,
            title: `${s.name} renews ${daysUntil === 0 ? "today" : daysUntil === 1 ? "tomorrow" : `in ${daysUntil} days`}`,
            description: `$${Number(s.amount).toFixed(2)} will be charged.`,
          });
        }
      });

      // Goal progress alerts
      goals.forEach((g: any) => {
        const daysLeft = Math.max(0, Math.ceil((new Date(g.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
        if (pct >= 100) {
          newAlerts.push({
            id: `goal-complete-${g.id}`,
            type: "info",
            icon: CheckCircle,
            title: `🎉 ${g.name} goal reached!`,
            description: `Congratulations! You've saved $${g.saved.toLocaleString()}.`,
          });
        } else if (daysLeft <= 14 && pct < 70) {
          newAlerts.push({
            id: `goal-risk-${g.id}`,
            type: "warning",
            icon: Target,
            title: `${g.name} at risk`,
            description: `Only ${daysLeft} days left and ${Math.round(pct)}% saved. You need $${(g.target - g.saved).toLocaleString()} more.`,
          });
        }
      });

      setAlerts(newAlerts);
    };
    generate();
  }, [user]);

  const visible = alerts.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  const typeStyles = {
    danger: "border-l-4 border-l-destructive bg-destructive/5",
    warning: "border-l-4 border-l-secondary bg-secondary/5",
    info: "border-l-4 border-l-primary bg-primary/5",
  };

  return (
    <div className="space-y-2">
      {visible.slice(0, 3).map((alert) => (
        <div key={alert.id} className={`rounded-lg px-4 py-3 flex items-center gap-3 ${typeStyles[alert.type]}`}>
          <alert.icon className={`h-4 w-4 shrink-0 ${
            alert.type === "danger" ? "text-destructive" : alert.type === "warning" ? "text-secondary" : "text-primary"
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{alert.title}</p>
            <p className="text-[11px] text-muted-foreground">{alert.description}</p>
          </div>
          <button
            onClick={() => setDismissed(prev => new Set([...prev, alert.id]))}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
