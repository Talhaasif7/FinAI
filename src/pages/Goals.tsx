import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Target, TrendingUp, Sparkles, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GoalProgressCard } from "@/components/GoalProgressCard";
import { GoalBarChart } from "@/components/GoalBarChart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const categoryEmojis: Record<string, string> = {
  travel: "✈️", gadget: "💻", emergency: "🛡️", investment: "📈", education: "🎓",
};

interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  category: string;
  priority: string;
  icon: string;
}

export default function Goals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [form, setForm] = useState({ name: "", target: "", deadline: "", category: "travel", priority: "medium" });

  const fetchGoals = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setGoals((data || []).map(g => ({ ...g, target: Number(g.target), saved: Number(g.saved) })));
    setLoading(false);
  };

  useEffect(() => { fetchGoals(); }, [user]);

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const goalBarData = goals.map(g => ({ name: g.name.split(" ").slice(0, 2).join(" "), saved: g.saved, target: g.target }));

  const handleAdd = async () => {
    if (!form.name || !form.target || !form.deadline || !user) return;
    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      name: form.name,
      target: parseFloat(form.target),
      saved: 0,
      deadline: form.deadline,
      category: form.category,
      priority: form.priority,
      icon: categoryEmojis[form.category] || "🎯",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setForm({ name: "", target: "", deadline: "", category: "travel", priority: "medium" });
    setOpen(false);
    fetchGoals();
  };

  const handleAddFunds = async () => {
    if (!selectedGoal || !addAmount || !user) return;
    const newSaved = Math.min(selectedGoal.saved + parseFloat(addAmount), selectedGoal.target);
    const { error } = await supabase
      .from("goals")
      .update({ saved: newSaved })
      .eq("id", selectedGoal.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Funds added!", description: `$${parseFloat(addAmount).toFixed(2)} added to ${selectedGoal.name}` });
    setAddAmount("");
    setAddFundsOpen(false);
    setSelectedGoal(null);
    fetchGoals();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Financial Goals</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and achieve your financial dreams</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-teal-light"><Plus className="h-4 w-4" /> New Goal</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">Create New Goal</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Goal Name</Label><Input placeholder="e.g. Trip to Singapore" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1" /></div>
              <div><Label>Target Amount ($)</Label><Input type="number" placeholder="3000" value={form.target} onChange={e => setForm({...form, target: e.target.value})} className="mt-1" /></div>
              <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
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
                  <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
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

      {/* Add Funds Dialog */}
      <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-display">Add Funds to {selectedGoal?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Current Progress</Label>
              <p className="text-sm text-muted-foreground mt-1">
                ${selectedGoal?.saved.toLocaleString()} / ${selectedGoal?.target.toLocaleString()} ({selectedGoal ? Math.round((selectedGoal.saved / selectedGoal.target) * 100) : 0}%)
              </p>
            </div>
            <div>
              <Label>Amount to Add ($)</Label>
              <Input type="number" placeholder="100" value={addAmount} onChange={e => setAddAmount(e.target.value)} className="mt-1" />
            </div>
            <Button onClick={handleAddFunds} className="w-full bg-primary text-primary-foreground hover:bg-teal-light gap-2">
              <DollarSign className="h-4 w-4" /> Add Funds
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card glow-teal">
          <div className="flex items-center gap-2 mb-2"><Target className="h-4 w-4 text-primary" /><span className="text-[11px] text-muted-foreground uppercase tracking-wider">Active Goals</span></div>
          <p className="font-display text-2xl font-bold text-foreground">{goals.length}</p>
        </div>
        <div className="stat-card glow-gold">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-secondary" /><span className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Saved</span></div>
          <p className="font-display text-2xl font-bold text-foreground">${totalSaved.toLocaleString()}</p>
        </div>
        <div className="stat-card glow-lavender">
          <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-lavender" /><span className="text-[11px] text-muted-foreground uppercase tracking-wider">Overall Progress</span></div>
          <p className="font-display text-2xl font-bold text-foreground">{totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%</p>
        </div>
      </motion.div>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.map((goal) => (
              <GoalProgressCard
                key={goal.id}
                goal={goal}
                onAddFunds={() => {
                  setSelectedGoal(goal);
                  setAddFundsOpen(true);
                }}
              />
            ))}
          </motion.div>
          <motion.div variants={item}><GoalBarChart data={goalBarData} /></motion.div>
        </div>
      ) : (
        <div className="glass-card p-10 text-center text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p>No goals yet. Create your first financial goal!</p>
        </div>
      )}
    </motion.div>
  );
}
