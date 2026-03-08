import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

interface Sub {
  id: string;
  name: string;
  amount: number;
  cycle: string;
  next_billing: string;
  category: string;
  logo: string | null;
}

export default function Subscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", cycle: "monthly", nextBilling: "", category: "Entertainment", logo: "" });

  const fetchSubs = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("subscriptions").select("*").order("next_billing");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setSubs((data || []).map(s => ({ ...s, amount: Number(s.amount) })));
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, [user]);

  const monthly = subs.reduce((s, sub) => s + (sub.cycle === "yearly" ? sub.amount / 12 : sub.amount), 0);
  const yearly = monthly * 12;

  const handleAdd = async () => {
    if (!form.name || !form.amount || !form.nextBilling || !user) return;
    const { error } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      name: form.name,
      amount: parseFloat(form.amount),
      cycle: form.cycle,
      next_billing: form.nextBilling,
      category: form.category,
      logo: form.logo || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setForm({ name: "", amount: "", cycle: "monthly", nextBilling: "", category: "Entertainment", logo: "" });
    setOpen(false);
    fetchSubs();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("subscriptions").delete().eq("id", id);
    fetchSubs();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your recurring payments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-teal-light"><Plus className="h-4 w-4" /> Add Sub</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display">Add Subscription</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Name</Label><Input placeholder="e.g. Netflix" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Amount ($)</Label><Input type="number" placeholder="9.99" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="mt-1" /></div>
                <div>
                  <Label>Cycle</Label>
                  <Select value={form.cycle} onValueChange={v => setForm({...form, cycle: v})}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Next Billing Date</Label><Input type="date" value={form.nextBilling} onChange={e => setForm({...form, nextBilling: e.target.value})} className="mt-1" /></div>
              <div><Label>Category</Label><Input placeholder="e.g. Entertainment" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="mt-1" /></div>
              <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground hover:bg-teal-light">Add Subscription</Button>
            </div>
          </DialogContent>
        </Dialog>
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
          <p className="font-display text-2xl font-bold text-foreground mt-1">{subs.length}</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="glass-card divide-y divide-border/30">
        {subs.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between px-4 sm:px-5 py-4 hover:bg-muted/20 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              {sub.logo ? (
                <img src={sub.logo} alt={sub.name} className="h-10 w-10 rounded-xl object-contain bg-muted/30 p-1.5" />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-muted/30 flex items-center justify-center text-sm font-bold text-muted-foreground">{sub.name.charAt(0)}</div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{sub.name}</p>
                <p className="text-[11px] text-muted-foreground">{sub.category} · Next: {sub.next_billing}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-display text-sm font-bold text-foreground">${Number(sub.amount).toFixed(2)}<span className="text-muted-foreground font-normal text-xs">/{sub.cycle === "monthly" ? "mo" : "yr"}</span></span>
              <button onClick={() => handleDelete(sub.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {subs.length === 0 && (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">No subscriptions yet. Add your first one!</div>
        )}
      </motion.div>
    </motion.div>
  );
}
