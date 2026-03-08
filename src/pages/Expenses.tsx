import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { expenses as initialExpenses, categoryIcons, type Expense } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const categories = ["Food", "Shopping", "Transport", "Entertainment", "Bills", "Health", "Other"];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ amount: "", category: "Food", merchant: "", date: new Date().toISOString().split("T")[0], paymentMethod: "Credit Card", note: "" });

  const filtered = expenses.filter(e =>
    e.merchant.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalThisMonth = expenses.reduce((s, e) => s + e.amount, 0);

  const handleAdd = () => {
    if (!form.amount || !form.merchant) return;
    const newExp: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(form.amount),
      category: form.category,
      merchant: form.merchant,
      date: form.date,
      paymentMethod: form.paymentMethod,
      note: form.note || undefined,
    };
    setExpenses([newExp, ...expenses]);
    setForm({ amount: "", category: "Food", merchant: "", date: new Date().toISOString().split("T")[0], paymentMethod: "Credit Card", note: "" });
    setOpen(false);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground text-sm mt-1">Track every dollar you spend</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-teal-light"><Plus className="h-4 w-4" /> Add Expense</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Add Expense</DialogTitle>
            </DialogHeader>
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
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-4">
        <div className="stat-card glow-teal min-w-[160px]">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">This Month</span>
          <p className="font-display text-xl font-bold text-foreground mt-1">${totalThisMonth.toFixed(2)}</p>
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="glass-card divide-y divide-border/30">
        {filtered.map((exp) => (
          <div key={exp.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/30 text-base">
                {categoryIcons[exp.category] || "📦"}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{exp.merchant}</p>
                <p className="text-[11px] text-muted-foreground">{exp.category} · {exp.paymentMethod}{exp.note ? ` · ${exp.note}` : ""}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">-${exp.amount.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground">{exp.date}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">No expenses found</div>
        )}
      </motion.div>
    </motion.div>
  );
}
