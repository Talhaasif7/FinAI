import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target, TrendingUp, Sparkles } from "lucide-react";
import { goals as initialGoals, type Goal } from "@/lib/mock-data";
import { GoalProgressCard } from "@/components/GoalProgressCard";
import { GoalBarChart } from "@/components/GoalBarChart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const categoryEmojis: Record<string, string> = {
  travel: "✈️", gadget: "💻", emergency: "🛡️", investment: "📈", education: "🎓",
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", target: "", deadline: "", category: "travel" as Goal["category"], priority: "medium" as Goal["priority"] });

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const goalBarData = goals.map(g => ({ name: g.name.split(" ").slice(0, 2).join(" "), saved: g.saved, target: g.target }));

  const handleAdd = () => {
    if (!form.name || !form.target || !form.deadline) return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: form.name,
      target: parseFloat(form.target),
      saved: 0,
      deadline: form.deadline,
      category: form.category,
      priority: form.priority,
      icon: categoryEmojis[form.category] || "🎯",
    };
    setGoals([...goals, newGoal]);
    setForm({ name: "", target: "", deadline: "", category: "travel", priority: "medium" });
    setOpen(false);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Financial Goals</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and achieve your financial dreams</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-teal-light">
              <Plus className="h-4 w-4" /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Goal Name</Label>
                <Input placeholder="e.g. Trip to Singapore" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>Target Amount ($)</Label>
                <Input type="number" placeholder="3000" value={form.target} onChange={e => setForm({...form, target: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>Deadline</Label>
                <Input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({...form, category: v as Goal["category"]})}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="travel">✈️ Travel</SelectItem>
                      <SelectItem value="gadget">💻 Gadget</SelectItem>
                      <SelectItem value="emergency">🛡️ Emergency</SelectItem>
                      <SelectItem value="investment">📈 Investment</SelectItem>
                      <SelectItem value="education">🎓 Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm({...form, priority: v as Goal["priority"]})}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground hover:bg-teal-light">Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Summary */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card glow-teal">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Active Goals</span>
          </div>
          <p className="font-display text-2xl font-bold text-foreground">{goals.length}</p>
        </div>
        <div className="stat-card glow-gold">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-secondary" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Saved</span>
          </div>
          <p className="font-display text-2xl font-bold text-foreground">${totalSaved.toLocaleString()}</p>
        </div>
        <div className="stat-card glow-lavender">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-lavender" />
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Overall Progress</span>
          </div>
          <p className="font-display text-2xl font-bold text-foreground">{Math.round((totalSaved / totalTarget) * 100)}%</p>
        </div>
      </motion.div>

      {/* Goals Grid + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map((goal) => (
            <GoalProgressCard key={goal.id} goal={goal} />
          ))}
        </motion.div>
        <motion.div variants={item}>
          <GoalBarChart data={goalBarData} />
        </motion.div>
      </div>

      {/* AI Tip */}
      <motion.div variants={item} className="glass-card p-5 border-primary/20 glow-teal">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">AI Recommendation</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you reduce food delivery spending by <span className="text-foreground font-medium">$45/week</span>, you'll reach your Singapore trip goal <span className="text-primary font-medium">2 weeks earlier</span>. Your current goal probability is <span className="text-secondary font-medium">78%</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
