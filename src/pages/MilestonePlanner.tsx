import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Milestone, Plus, Home, Heart, Briefcase, Globe, Baby,
  GraduationCap, Loader2, Sparkles, Trash2, ChevronRight,
  Calendar, DollarSign, Target, ArrowLeft, Edit2, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const PLANNER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/milestone-planner`;

const CATEGORIES = [
  { value: "house", label: "Buy a House", icon: Home, emoji: "🏠", defaultCost: 50000 },
  { value: "marriage", label: "Get Married", icon: Heart, emoji: "💍", defaultCost: 25000 },
  { value: "business", label: "Start a Business", icon: Briefcase, emoji: "🚀", defaultCost: 30000 },
  { value: "relocation", label: "Move Abroad", icon: Globe, emoji: "✈️", defaultCost: 18000 },
  { value: "children", label: "Have Children", icon: Baby, emoji: "👶", defaultCost: 20000 },
  { value: "education", label: "Education", icon: GraduationCap, emoji: "🎓", defaultCost: 40000 },
  { value: "other", label: "Other", icon: Target, emoji: "🎯", defaultCost: 10000 },
];

interface MilestoneData {
  id: string;
  title: string;
  category: string;
  icon: string;
  target_date: string;
  estimated_cost: number;
  saved_amount: number;
  monthly_target: number;
  ai_roadmap: string | null;
  status: string;
  priority: number;
  notes: string | null;
}

export default function MilestonePlanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [financialContext, setFinancialContext] = useState<any>(null);

  // Create form
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("house");
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newCost, setNewCost] = useState("");
  const [newSaved, setNewSaved] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const loadMilestones = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("milestones")
      .select("*")
      .eq("status", "active")
      .order("priority", { ascending: true });
    setMilestones((data as MilestoneData[]) || []);
    setLoading(false);
  }, [user]);

  const loadContext = useCallback(async () => {
    if (!user) return;
    const [expRes, subRes, goalRes] = await Promise.all([
      supabase.from("expenses").select("amount").gte("date", new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0]),
      supabase.from("subscriptions").select("amount, cycle"),
      supabase.from("goals").select("saved, target"),
    ]);
    const totalExp = (expRes.data || []).reduce((s, e) => s + Number(e.amount), 0);
    const months = 3;
    const monthlySubs = (subRes.data || []).reduce((s, sub) =>
      s + (sub.cycle === "yearly" ? Number(sub.amount) / 12 : Number(sub.amount)), 0);
    setFinancialContext({
      monthlyExpenses: Math.round(totalExp / months),
      monthlySubscriptions: Math.round(monthlySubs),
      goalCount: (goalRes.data || []).length,
      totalSaved: (goalRes.data || []).reduce((s, g) => s + Number(g.saved), 0),
    });
  }, [user]);

  useEffect(() => { loadMilestones(); loadContext(); }, [loadMilestones, loadContext]);

  const createMilestone = async () => {
    if (!user || !newTitle.trim() || !newDate) return;
    const cat = CATEGORIES.find(c => c.value === newCategory);
    const cost = Number(newCost) || cat?.defaultCost || 10000;
    const saved = Number(newSaved) || 0;
    const monthsUntil = Math.max(1, Math.round((newDate.getTime() - Date.now()) / (30 * 86400000)));
    const monthlyTarget = Math.ceil((cost - saved) / monthsUntil);

    const { error } = await supabase.from("milestones").insert({
      user_id: user.id,
      title: newTitle,
      category: newCategory,
      icon: cat?.emoji || "🎯",
      target_date: format(newDate, "yyyy-MM-dd"),
      estimated_cost: cost,
      saved_amount: saved,
      monthly_target: monthlyTarget,
      notes: newNotes || null,
      priority: milestones.length + 1,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Milestone created!", description: `${newTitle} added to your roadmap.` });
      setShowCreate(false);
      resetForm();
      loadMilestones();
    }
  };

  const resetForm = () => {
    setNewTitle(""); setNewCategory("house"); setNewDate(undefined);
    setNewCost(""); setNewSaved(""); setNewNotes("");
  };

  const generateRoadmap = async (milestone: MilestoneData) => {
    setIsGenerating(true);
    try {
      const resp = await fetch(PLANNER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ milestone, financialContext }),
      });
      if (!resp.ok) throw new Error("Failed to generate roadmap");
      const { roadmap } = await resp.json();

      await supabase.from("milestones").update({ ai_roadmap: roadmap }).eq("id", milestone.id);
      setSelectedMilestone({ ...milestone, ai_roadmap: roadmap });
      setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, ai_roadmap: roadmap } : m));
      toast({ title: "Roadmap generated!", description: "AI has built your financial plan." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteMilestone = async (id: string) => {
    await supabase.from("milestones").delete().eq("id", id);
    setMilestones(prev => prev.filter(m => m.id !== id));
    if (selectedMilestone?.id === id) setSelectedMilestone(null);
    toast({ title: "Milestone deleted" });
  };

  const updateSaved = async (id: string, amount: number) => {
    const milestone = milestones.find(m => m.id === id);
    if (!milestone) return;
    const newSaved = Math.max(0, milestone.saved_amount + amount);
    await supabase.from("milestones").update({ saved_amount: newSaved }).eq("id", id);
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, saved_amount: newSaved } : m));
    if (selectedMilestone?.id === id) setSelectedMilestone({ ...selectedMilestone, saved_amount: newSaved });
  };

  if (selectedMilestone) {
    const progress = selectedMilestone.estimated_cost > 0
      ? Math.min(100, (selectedMilestone.saved_amount / selectedMilestone.estimated_cost) * 100)
      : 0;
    const remaining = selectedMilestone.estimated_cost - selectedMilestone.saved_amount;
    const monthsLeft = Math.max(1, Math.round((new Date(selectedMilestone.target_date).getTime() - Date.now()) / (30 * 86400000)));

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => setSelectedMilestone(null)} className="text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to milestones
        </Button>

        {/* Milestone Header */}
        <div className="flex items-start gap-4">
          <div className="text-4xl">{selectedMilestone.icon}</div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-foreground">{selectedMilestone.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(new Date(selectedMilestone.target_date), "MMM yyyy")}</span>
              <span>•</span>
              <span>{monthsLeft} months left</span>
            </div>
          </div>
          <Badge variant={progress >= 100 ? "default" : "secondary"} className="text-xs">
            {progress >= 100 ? "🎉 Complete" : `${Math.round(progress)}%`}
          </Badge>
        </div>

        {/* Progress & Stats */}
        <Card className="glass-card border-border/50">
          <CardContent className="pt-5 space-y-4">
            <Progress value={progress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold font-mono text-primary">${selectedMilestone.saved_amount.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Saved</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-foreground">${selectedMilestone.estimated_cost.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Total Cost</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-accent">${Math.ceil(remaining / monthsLeft).toLocaleString()}/mo</p>
                <p className="text-[10px] text-muted-foreground">Monthly Target</p>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button size="sm" variant="outline" onClick={() => updateSaved(selectedMilestone.id, 100)}>+$100</Button>
              <Button size="sm" variant="outline" onClick={() => updateSaved(selectedMilestone.id, 500)}>+$500</Button>
              <Button size="sm" variant="outline" onClick={() => updateSaved(selectedMilestone.id, 1000)}>+$1,000</Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Roadmap */}
        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Financial Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMilestone.ai_roadmap ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{selectedMilestone.ai_roadmap}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">Get a personalized financial roadmap from AI</p>
                <Button onClick={() => generateRoadmap(selectedMilestone)} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate Roadmap
                </Button>
              </div>
            )}
            {selectedMilestone.ai_roadmap && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => generateRoadmap(selectedMilestone)} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Regenerate
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Milestone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Life Milestone Planner</h1>
            <p className="text-xs text-muted-foreground">Plan your life's biggest moments financially</p>
          </div>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Milestone</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Plan a Life Milestone</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">What's the milestone?</label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Move to Singapore" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <Select value={newCategory} onValueChange={v => {
                  setNewCategory(v);
                  const cat = CATEGORIES.find(c => c.value === v);
                  if (cat && !newCost) setNewCost(String(cat.defaultCost));
                }}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.emoji} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Target Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full mt-1 justify-start text-left font-normal", !newDate && "text-muted-foreground")}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {newDate ? format(newDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={newDate}
                      onSelect={setNewDate}
                      disabled={d => d < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Estimated Cost ($)</label>
                  <Input type="number" value={newCost} onChange={e => setNewCost(e.target.value)} placeholder="18,000" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Already Saved ($)</label>
                  <Input type="number" value={newSaved} onChange={e => setNewSaved(e.target.value)} placeholder="0" className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <Textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Any details for the AI planner..." className="mt-1" rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createMilestone} disabled={!newTitle.trim() || !newDate}>
                <Plus className="h-4 w-4 mr-1" /> Create Milestone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Milestones Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : milestones.length === 0 ? (
        <Card className="glass-card border-border/50">
          <CardContent className="py-16 text-center">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="font-display text-lg font-bold text-foreground mb-2">Start Planning Your Future</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Add life milestones like buying a house, getting married, or moving abroad. AI will build you a personalized financial roadmap.
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Your First Milestone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {milestones.map((m, idx) => {
            const progress = m.estimated_cost > 0 ? Math.min(100, (m.saved_amount / m.estimated_cost) * 100) : 0;
            const monthsLeft = Math.max(0, Math.round((new Date(m.target_date).getTime() - Date.now()) / (30 * 86400000)));
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className="glass-card border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => setSelectedMilestone(m)}
                >
                  <CardContent className="py-4 flex items-center gap-4">
                    <div className="text-3xl">{m.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground text-sm truncate">{m.title}</h3>
                        {m.ai_roadmap && (
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Roadmap
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                        <span>${m.saved_amount.toLocaleString()} / ${m.estimated_cost.toLocaleString()}</span>
                        <span>•</span>
                        <span>{monthsLeft}mo left</span>
                        <span>•</span>
                        <span className="text-accent">${m.monthly_target.toLocaleString()}/mo</span>
                      </div>
                      <Progress value={progress} className="h-1.5 mt-2" />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        onClick={e => { e.stopPropagation(); deleteMilestone(m.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quick Category Cards */}
      {milestones.length > 0 && milestones.length < 6 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Add another milestone</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter(c => !milestones.some(m => m.category === c.value)).slice(0, 4).map(c => (
              <button
                key={c.value}
                onClick={() => {
                  setNewCategory(c.value);
                  setNewCost(String(c.defaultCost));
                  setNewTitle(c.label);
                  setShowCreate(true);
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
