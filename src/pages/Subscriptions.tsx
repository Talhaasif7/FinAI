import { motion } from "framer-motion";
import { CreditCard, Sparkles } from "lucide-react";
import { subscriptions } from "@/lib/mock-data";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function Subscriptions() {
  const monthly = subscriptions.reduce((s, sub) => s + sub.amount, 0);
  const yearly = monthly * 12;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your recurring payments</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card glow-teal">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Monthly Cost</span>
          <p className="font-display text-2xl font-bold text-foreground mt-1">${monthly.toFixed(2)}</p>
        </div>
        <div className="stat-card glow-gold">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Yearly Cost</span>
          <p className="font-display text-2xl font-bold text-foreground mt-1">${yearly.toFixed(2)}</p>
        </div>
        <div className="stat-card glow-lavender">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Active Subs</span>
          <p className="font-display text-2xl font-bold text-foreground mt-1">{subscriptions.length}</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="glass-card divide-y divide-border/30">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{sub.name}</p>
                <p className="text-[11px] text-muted-foreground">{sub.category} · Next: {sub.nextBilling}</p>
              </div>
            </div>
            <span className="font-display text-sm font-bold text-foreground">${sub.amount.toFixed(2)}<span className="text-muted-foreground font-normal text-xs">/{sub.cycle === "monthly" ? "mo" : "yr"}</span></span>
          </div>
        ))}
      </motion.div>

      <motion.div variants={item} className="glass-card p-5 border-secondary/20 glow-gold">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 shrink-0">
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Optimization Tip</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You're paying for <span className="text-foreground font-medium">2 streaming services</span>. Cancelling one could save <span className="text-primary font-medium">$15.99/month ($191.88/year)</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
