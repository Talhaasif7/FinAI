import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Wallet, AlertTriangle, CheckCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { categoryIcons } from "@/lib/mock-data";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const categories = ["Food", "Shopping", "Transport", "Entertainment", "Bills", "Health", "Other", "Investments", "Savings"];

interface Budget {
  id: string;
  category: string;
  monthly_limit: number;
}

export default function Budgets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "Food", monthlyLimit: "" });

  const fetchData = async () => {
    if (!user) return;
    const [budgetRes, expenseRes] = await Promise.all([
      supabase.from("budgets").select("*").order("category"),
      supabase.from("expenses").select("*"),
    ]);
    setBudgets((budgetRes.data || []).map(b => ({ ...b, monthly_limit: Number(b.monthly_limit) })));
    setExpenses((expenseRes.data || []).map(e => ({ ...e, amount: Number(e.amount) })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  // Calculate current month spending by category
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const spentByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    if (e.date?.startsWith(currentMonth)) {
      spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
    }
  });

  const totalBudget = budgets.reduce((s, b) => s + b.monthly_limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spentByCategory[b.category] || 0), 0);
  const overBudgetCount = budgets.filter(b => (spentByCategory[b.category] || 0) > b.monthly_limit).length;

  const handleAdd = async () => {
    if (!form.monthlyLimit || !user) return;
    const existing = budgets.find(b => b.category === form.category);
    if (existing) {
      const { error } = await supabase.from("budgets").update({ monthly_limit: parseFloat(form.monthlyLimit) }).eq("id", existing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("budgets").insert({
        user_id: user.id,
        category: form.category,
        monthly_limit: parseFloat(form.monthlyLimit),
      });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    setForm({ category: "Food", monthlyLimit: "" });
    setOpen(false);
    fetchData();
    toast({ title: "Budget saved!" });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("budgets").delete().eq("id", id);
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Budgets</h1>
          <p className="text-muted-foreground text-sm mt-1">Set spending limits per category</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-teal-light"><Plus className="h-4 w-4" /> Set Budget</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">Set Category Budget</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{categoryIcons[c] || "📦"} {c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Monthly Limit ($)</Label>
                <Input type="number" placeholder="500" value={form.monthlyLimit} onChange={e => setForm({ ...form, monthlyLimit: e.target.value })} className="mt-1" />
              </div>
              <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground hover:bg-teal-light">Save Budget</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card glow-teal">
          <div className="flex items-center gap-2 mb-2"><Wallet className="h-4 w-4 text-primary" /><span className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Budget</span></div>
          <p className="font-display text-2xl font-bold text-foreground">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="stat-card glow-gold">
          <div className="flex items-center gap-2 mb-2"><Wallet className="h-4 w-4 text-secondary" /><span className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Spent</span></div>
          <p className="font-display text-2xl font-bold text-foreground">${totalSpent.toLocaleString()}</p>
        </div>
        <div className={`stat-card ${overBudgetCount > 0 ? "border-destructive/30" : "glow-lavender"}`}>
          <div className="flex items-center gap-2 mb-2">
            {overBudgetCount > 0 ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-primary" />}
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Over Budget</span>
          </div>
          <p className={`font-display text-2xl font-bold ${overBudgetCount > 0 ? "text-destructive" : "text-foreground"}`}>{overBudgetCount}</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        {budgets.map((budget) => {
          const spent = spentByCategory[budget.category] || 0;
          const pct = Math.min(Math.round((spent / budget.monthly_limit) * 100), 100);
          const isOver = spent > budget.monthly_limit;
          const remaining = budget.monthly_limit - spent;

          return (
            <div key={budget.id} className={`glass-card p-5 group ${isOver ? "border-destructive/30" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{categoryIcons[budget.category] || "📦"}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{budget.category}</p>
                    <p className="text-[11px] text-muted-foreground">
                      ${spent.toFixed(0)} / ${budget.monthly_limit.toFixed(0)}
                      {isOver && <span className="text-destructive ml-1 font-semibold">· ${Math.abs(remaining).toFixed(0)} over!</span>}
                      {!isOver && <span className="text-primary ml-1">· ${remaining.toFixed(0)} left</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-display text-lg font-bold ${isOver ? "text-destructive" : pct > 80 ? "text-secondary" : "text-primary"}`}>
                    {pct}%
                  </span>
                  <button onClick={() => handleDelete(budget.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: isOver
                      ? "hsl(var(--destructive))"
                      : pct > 80
                        ? "var(--gradient-warning)"
                        : "var(--gradient-primary)",
                  }}
                />
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && (
          <div className="glass-card p-10 text-center text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>No budgets set. Create your first budget to track spending limits!</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
