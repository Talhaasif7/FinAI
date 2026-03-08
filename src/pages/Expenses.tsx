import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, Camera, Loader2 } from "lucide-react";
import { categoryIcons } from "@/lib/mock-data";
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

const categories = ["Food", "Shopping", "Transport", "Entertainment", "Bills", "Health", "Other"];

interface Expense {
  id: string;
  amount: number;
  category: string;
  merchant: string;
  date: string;
  payment_method: string;
  note: string | null;
  logo: string | null;
}

export default function Expenses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ amount: "", category: "Food", merchant: "", date: new Date().toISOString().split("T")[0], paymentMethod: "Credit Card", note: "" });

  const fetchExpenses = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });
    if (error) {
      toast({ title: "Error loading expenses", description: error.message, variant: "destructive" });
    } else {
      setExpenses(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchExpenses(); }, [user]);

  // Update streak when adding an expense
  const updateStreak = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data: streak } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).single();
    
    if (!streak) {
      await supabase.from("user_streaks").insert({ user_id: user.id, current_streak: 1, longest_streak: 1, last_tracked_date: today });
      return;
    }

    if (streak.last_tracked_date === today) return; // Already tracked today

    const lastDate = new Date(streak.last_tracked_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = diffDays === 1 ? streak.current_streak + 1 : 1;
    let longestStreak = Math.max(streak.longest_streak, newStreak);

    await supabase.from("user_streaks").update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_tracked_date: today,
    }).eq("user_id", user.id);
  };

  const filtered = expenses.filter(e =>
    e.merchant.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalThisMonth = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const handleAdd = async () => {
    if (!form.amount || !form.merchant || !user) return;
    const { error } = await supabase.from("expenses").insert({
      user_id: user.id,
      amount: parseFloat(form.amount),
      category: form.category,
      merchant: form.merchant,
      date: form.date,
      payment_method: form.paymentMethod,
      note: form.note || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await updateStreak();
    setForm({ amount: "", category: "Food", merchant: "", date: new Date().toISOString().split("T")[0], paymentMethod: "Credit Card", note: "" });
    setOpen(false);
    fetchExpenses();
    toast({ title: "Expense added!" });
  };

  const handleScanReceipt = async (file: File) => {
    if (!user) return;
    setScanning(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("scan-receipt", {
        body: { imageBase64: base64 },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Pre-fill the form with scanned data
      setForm({
        amount: data.amount?.toString() || "",
        category: data.category || "Other",
        merchant: data.merchant || "",
        date: data.date || new Date().toISOString().split("T")[0],
        paymentMethod: "Credit Card",
        note: data.items ? data.items.map((i: any) => `${i.name}: $${i.price}`).join(", ") : "",
      });
      setScanOpen(false);
      setOpen(true);
      toast({ title: "Receipt scanned!", description: `Found: ${data.merchant} - $${data.amount}` });
    } catch (e: any) {
      toast({ title: "Scan failed", description: e.message || "Could not read receipt", variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("expenses").delete().eq("id", id);
    fetchExpenses();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground text-sm mt-1">Track every dollar you spend</p>
        </div>
        <div className="flex gap-2">
          {/* Scan Receipt */}
          <Dialog open={scanOpen} onOpenChange={setScanOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
                <Camera className="h-4 w-4" /> Scan Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="font-display">📸 Scan Receipt</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">Upload a photo of your receipt and AI will extract the details automatically.</p>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleScanReceipt(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    disabled={scanning}
                  />
                  <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/40 transition-colors">
                    {scanning ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">AI is reading your receipt...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Tap to take a photo or upload an image</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Manual Add */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-teal-light"><Plus className="h-4 w-4" /> Add Expense</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="font-display">Add Expense</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Amount ($)</Label>
                    <Input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c} value={c}>{categoryIcons[c] || "📦"} {c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Merchant</Label>
                  <Input placeholder="e.g. Starbucks" value={form.merchant} onChange={e => setForm({...form, merchant: e.target.value})} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="mt-1" />
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <Select value={form.paymentMethod} onValueChange={v => setForm({...form, paymentMethod: v})}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Debit Card">Debit Card</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Apple Pay">Apple Pay</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Note (optional)</Label>
                  <Input placeholder="Add a note..." value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="mt-1" />
                </div>
                <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground hover:bg-teal-light">Add Expense</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="stat-card glow-teal min-w-[160px]">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">This Month</span>
          <p className="font-display text-xl font-bold text-foreground mt-1">${totalThisMonth.toFixed(2)}</p>
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </motion.div>

      <motion.div variants={item} className="glass-card divide-y divide-border/30">
        {filtered.map((exp) => (
          <div key={exp.id} className="flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-muted/20 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/30 text-base shrink-0">
                {categoryIcons[exp.category] || "📦"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{exp.merchant}</p>
                <p className="text-[11px] text-muted-foreground truncate">{exp.category} · {exp.payment_method}{exp.note ? ` · ${exp.note}` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">-${Number(exp.amount).toFixed(2)}</p>
                <p className="text-[11px] text-muted-foreground">{exp.date}</p>
              </div>
              <button onClick={() => handleDelete(exp.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">
            {expenses.length === 0 ? "No expenses yet. Add your first expense!" : "No expenses found"}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
