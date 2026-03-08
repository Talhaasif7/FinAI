import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CreditCard, Wifi, Globe, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const PAKISTAN_BANKS = [
  { name: "HBL", full: "Habib Bank Limited", color: "#006B3F" },
  { name: "UBL", full: "United Bank Limited", color: "#1B3A6B" },
  { name: "MCB", full: "MCB Bank", color: "#8B0000" },
  { name: "Allied Bank", full: "Allied Bank Limited", color: "#003366" },
  { name: "Bank Alfalah", full: "Bank Alfalah", color: "#C8102E" },
  { name: "Meezan Bank", full: "Meezan Bank", color: "#005030" },
  { name: "Faysal Bank", full: "Faysal Bank", color: "#1A237E" },
  { name: "Standard Chartered PK", full: "Standard Chartered Pakistan", color: "#007A33" },
  { name: "JazzCash", full: "JazzCash Mobile Wallet", color: "#E4002B" },
  { name: "Easypaisa", full: "Easypaisa by Telenor", color: "#00A651" },
  { name: "SadaPay", full: "SadaPay", color: "#1A1A2E" },
  { name: "NayaPay", full: "NayaPay", color: "#6C3CE1" },
];

const INTERNATIONAL_BANKS = [
  { name: "Chase", full: "JPMorgan Chase", color: "#005EB8" },
  { name: "Bank of America", full: "Bank of America", color: "#012169" },
  { name: "Citi", full: "Citibank", color: "#003B70" },
  { name: "HSBC", full: "HSBC Holdings", color: "#DB0011" },
  { name: "Barclays", full: "Barclays Bank", color: "#00AEEF" },
  { name: "Wells Fargo", full: "Wells Fargo", color: "#D71E28" },
  { name: "Deutsche Bank", full: "Deutsche Bank", color: "#0018A8" },
  { name: "Revolut", full: "Revolut", color: "#0075EB" },
  { name: "Wise", full: "Wise (TransferWise)", color: "#9FE870" },
  { name: "N26", full: "N26 Bank", color: "#36A18B" },
  { name: "Monzo", full: "Monzo Bank", color: "#E7503B" },
  { name: "Other", full: "Other Bank", color: "#4A5568" },
];

const CARD_NETWORKS = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex", label: "American Express" },
  { value: "unionpay", label: "UnionPay" },
  { value: "paypak", label: "PayPak" },
  { value: "other", label: "Other" },
];

interface LinkedCard {
  id: string;
  bank_name: string;
  card_type: string;
  card_network: string;
  last_four: string;
  cardholder_name: string;
  region: string;
  color: string;
}

function CardVisual({ card }: { card: LinkedCard }) {
  const networkLabel = CARD_NETWORKS.find(n => n.value === card.card_network)?.label || card.card_network;
  return (
    <motion.div
      whileHover={{ scale: 1.03, rotateY: 5 }}
      className="relative w-full aspect-[1.6/1] rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
      style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}dd, ${card.color}99)` }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
        <Wifi className="h-4 w-4 text-white/80 rotate-90" />
      </div>

      <div className="relative h-full flex flex-col justify-between p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">{card.bank_name}</span>
          <span className="text-white/60 text-[10px] uppercase tracking-wider">{card.card_type}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="h-8 w-10 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-[1px] h-4 w-5">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-yellow-700/30 rounded-[1px]" />)}
            </div>
          </div>
        </div>

        <div>
          <p className="text-white font-mono text-lg sm:text-xl tracking-[0.2em] font-medium">
            •••• •••• •••• {card.last_four}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-[9px] uppercase tracking-wider mb-0.5">Card Holder</p>
            <p className="text-white text-xs font-semibold uppercase tracking-wide">{card.cardholder_name}</p>
          </div>
          <div className="text-right">
            <p className="text-white/90 text-sm font-bold">{networkLabel}</p>
            {card.region === "pakistan" && <span className="text-white/50 text-[9px]">🇵🇰 PKR</span>}
            {card.region === "international" && <span className="text-white/50 text-[9px]">🌐 Multi</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Cards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<LinkedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [bankTab, setBankTab] = useState("pakistan");
  const [form, setForm] = useState({
    bank_name: "", card_type: "debit", card_network: "visa",
    last_four: "", cardholder_name: "", region: "pakistan", color: "#1a1a2e",
  });

  const fetchCards = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("linked_cards")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setCards(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCards(); }, [user]);

  const selectBank = (bank: typeof PAKISTAN_BANKS[0], region: string) => {
    setForm(prev => ({ ...prev, bank_name: bank.name, color: bank.color, region, card_network: region === "pakistan" ? "paypak" : "visa" }));
  };

  const handleAdd = async () => {
    if (!form.bank_name || !form.last_four || !form.cardholder_name || !user) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (form.last_four.length !== 4 || !/^\d{4}$/.test(form.last_four)) {
      toast({ title: "Invalid", description: "Last 4 digits must be exactly 4 numbers", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("linked_cards").insert({ ...form, user_id: user.id });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setForm({ bank_name: "", card_type: "debit", card_network: "visa", last_four: "", cardholder_name: "", region: "pakistan", color: "#1a1a2e" });
    setOpen(false);
    fetchCards();
    toast({ title: "Card linked!", description: `${form.bank_name} card added successfully` });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("linked_cards").delete().eq("id", id);
    fetchCards();
    toast({ title: "Card removed" });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  const pkCards = cards.filter(c => c.region === "pakistan");
  const intlCards = cards.filter(c => c.region === "international");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Cards</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your linked bank cards</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-teal-light">
              <Plus className="h-4 w-4" /> Link Card
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Link a Bank Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              {/* Region Tabs */}
              <Tabs value={bankTab} onValueChange={setBankTab}>
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="pakistan" className="gap-1.5"><MapPin className="h-3.5 w-3.5" /> Pakistan</TabsTrigger>
                  <TabsTrigger value="international" className="gap-1.5"><Globe className="h-3.5 w-3.5" /> International</TabsTrigger>
                </TabsList>

                <TabsContent value="pakistan" className="mt-3">
                  <div className="grid grid-cols-3 gap-2">
                    {PAKISTAN_BANKS.map(bank => (
                      <button
                        key={bank.name}
                        onClick={() => selectBank(bank, "pakistan")}
                        className={`rounded-xl p-3 text-center transition-all duration-200 border ${
                          form.bank_name === bank.name && form.region === "pakistan"
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border/30 hover:border-border hover:bg-muted/30"
                        }`}
                      >
                        <div
                          className="h-8 w-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: bank.color }}
                        >
                          {bank.name.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="text-[10px] font-medium text-foreground truncate">{bank.name}</p>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="international" className="mt-3">
                  <div className="grid grid-cols-3 gap-2">
                    {INTERNATIONAL_BANKS.map(bank => (
                      <button
                        key={bank.name}
                        onClick={() => selectBank(bank, "international")}
                        className={`rounded-xl p-3 text-center transition-all duration-200 border ${
                          form.bank_name === bank.name && form.region === "international"
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border/30 hover:border-border hover:bg-muted/30"
                        }`}
                      >
                        <div
                          className="h-8 w-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: bank.color }}
                        >
                          {bank.name.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="text-[10px] font-medium text-foreground truncate">{bank.name}</p>
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {form.bank_name && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/30 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: form.color }}>
                      {form.bank_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{form.bank_name}</p>
                      <p className="text-[10px] text-muted-foreground">{form.region === "pakistan" ? "🇵🇰 Pakistan" : "🌐 International"}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Cardholder Name</Label>
                    <Input placeholder="JOHN DOE" value={form.cardholder_name} onChange={e => setForm({ ...form, cardholder_name: e.target.value.toUpperCase() })} className="mt-1 uppercase" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Last 4 Digits</Label>
                      <Input placeholder="1234" maxLength={4} value={form.last_four} onChange={e => setForm({ ...form, last_four: e.target.value.replace(/\D/g, "") })} className="mt-1 font-mono tracking-widest" />
                    </div>
                    <div>
                      <Label>Card Type</Label>
                      <Select value={form.card_type} onValueChange={v => setForm({ ...form, card_type: v })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debit">Debit</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                          <SelectItem value="prepaid">Prepaid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Card Network</Label>
                    <Select value={form.card_network} onValueChange={v => setForm({ ...form, card_network: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CARD_NETWORKS.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Live Preview */}
                  <div className="pt-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
                    <div className="max-w-xs">
                      <CardVisual card={{ ...form, id: "preview" } as LinkedCard} />
                    </div>
                  </div>

                  <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground hover:bg-teal-light">
                    Link Card
                  </Button>
                </motion.div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card glow-teal">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Cards</span>
          <p className="font-display text-2xl font-bold text-foreground mt-1">{cards.length}</p>
        </div>
        <div className="stat-card glow-gold">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Pakistan</span>
          <p className="font-display text-2xl font-bold text-foreground mt-1">{pkCards.length}</p>
        </div>
        <div className="stat-card glow-lavender">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">International</span>
          <p className="font-display text-2xl font-bold text-foreground mt-1">{intlCards.length}</p>
        </div>
      </motion.div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <motion.div variants={item} className="glass-card p-10 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-sm">No cards linked yet. Add your first bank card!</p>
        </motion.div>
      ) : (
        <>
          {pkCards.length > 0 && (
            <motion.div variants={item}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Pakistan Cards
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {pkCards.map(card => (
                    <motion.div key={card.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative group">
                      <CardVisual card={card} />
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm rounded-full p-2 hover:bg-destructive/80"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-white" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {intlCards.length > 0 && (
            <motion.div variants={item}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" /> International Cards
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {intlCards.map(card => (
                    <motion.div key={card.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative group">
                      <CardVisual card={card} />
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm rounded-full p-2 hover:bg-destructive/80"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-white" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
