import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Target, Brain, TrendingUp, CreditCard,
  Shield, Zap, BarChart3, Star, Receipt,
  ChevronRight, Globe, Smartphone, ArrowUpRight,
  Wallet, PieChart, Bell, Award, Check, Flame,
  Bot, Trophy, Camera, ChevronDown, Users,
  LineChart, Sparkles, Lock, Eye, Heart,
  Play, Menu, X, MousePointer2, Fingerprint,
  Layers, CircleDot, DollarSign, Coins, BadgePercent
} from "lucide-react";
import { Scene3D, Scene3DFeatures } from "@/components/Scene3D";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarMarcus from "@/assets/avatar-marcus.jpg";
import avatarAisha from "@/assets/avatar-aisha.jpg";
import avatarJames from "@/assets/avatar-james.jpg";
import avatarLisa from "@/assets/avatar-lisa.jpg";

/* ── Animations ─────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.8, delay: i * 0.12, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
};

/* ── Data ───────────────────────────────────────────────── */
const features = [
  { icon: Target, title: "Smart Goals", desc: "AI-powered savings plans with dynamic adjustments based on your real spending behavior.", cardClass: "revolut-card-green", tag: "Goals" },
  { icon: Brain, title: "AI Financial Coach", desc: "Conversational AI that answers questions, gives advice, and finds savings opportunities.", cardClass: "revolut-card-purple", tag: "AI" },
  { icon: BarChart3, title: "Deep Analytics", desc: "Spending personality analysis, forecasts, and financial health scores updated in real-time.", cardClass: "revolut-card-amber", tag: "Insights" },
  { icon: CreditCard, title: "Subscription Manager", desc: "Auto-detect recurring charges. Get alerts before renewals and find subscriptions to cut.", cardClass: "revolut-card-teal", tag: "Subs" },
  { icon: Camera, title: "Receipt Scanner", desc: "Snap a photo of any receipt. AI extracts merchant, amount, items, and categorizes instantly.", cardClass: "revolut-card-pink", tag: "OCR" },
  { icon: Trophy, title: "Gamification", desc: "Earn achievements, maintain streaks, and compete in weekly savings challenges.", cardClass: "revolut-card-dark", tag: "Fun" },
];

const stats = [
  { value: 50, suffix: "K+", label: "Active Users" },
  { value: 2.4, suffix: "M", label: "Goals Achieved", prefix: "$" },
  { value: 94, suffix: "%", label: "Success Rate" },
  { value: 4.9, suffix: "★", label: "App Rating" },
];

const testimonials = [
  { name: "Sarah K.", role: "Freelancer", text: "FinAI helped me save $3,200 in 3 months for my Japan trip. The AI insights are incredibly accurate.", avatar: avatarSarah, saved: "$3,200" },
  { name: "Marcus T.", role: "Software Engineer", text: "I never realized how much I was spending on subscriptions. FinAI identified 6 unused ones — saving me $80/month.", avatar: avatarMarcus, saved: "$960/yr" },
  { name: "Aisha R.", role: "Graduate Student", text: "The receipt scanner is a game-changer. I just snap a photo and everything is tracked automatically.", avatar: avatarAisha, saved: "$1,800" },
];

const painPoints = [
  { emoji: "😰", problem: "No idea where money goes", solution: "AI auto-categorizes every transaction" },
  { emoji: "📊", problem: "Spreadsheets are tedious", solution: "Beautiful dashboards update in real-time" },
  { emoji: "🎯", problem: "Goals feel impossible", solution: "AI calculates exactly how much to save weekly" },
  { emoji: "💳", problem: "Forgotten subscriptions", solution: "Auto-detect and alert before every renewal" },
];

const pricingPlans = [
  { name: "Free", price: "$0", period: "forever", features: ["5 goals", "50 expenses/mo", "Basic insights", "Receipt scanner"], cta: "Start Free", popular: false, priceId: null },
  { name: "Pro", price: "$7", period: "/month", features: ["Unlimited goals", "Unlimited expenses", "AI Coach access", "Advanced analytics", "Weekly AI reports", "Priority support"], cta: "Start Pro Trial", popular: true, priceId: "price_1T8eCr2N83SQqQkDobIkteJH" },
  { name: "Team", price: "$11", period: "/month", features: ["Everything in Pro", "Shared family goals", "Multi-user access", "Export reports", "API access", "Custom categories"], cta: "Get Team", popular: false, priceId: "price_1T8eEZ2N83SQqQkDxMu5ul9U" },
];

const faqs = [
  { q: "Is FinAI really free?", a: "Yes! The free plan includes goal tracking, expense management, basic insights, and receipt scanning. Upgrade for unlimited access and AI coaching." },
  { q: "How does the AI work?", a: "FinAI uses advanced language models to analyze your spending patterns, predict future expenses, and generate personalized saving strategies." },
  { q: "Is my financial data secure?", a: "Absolutely. We use bank-grade encryption (AES-256), never store raw bank credentials, and comply with SOC 2 and GDPR standards." },
  { q: "Can I export my data?", a: "Yes. Pro and Team plans can export to CSV, PDF, or connect via API. Your data belongs to you, always." },
];

const trustedBy = ["Forbes", "TechCrunch", "Product Hunt", "Y Combinator", "Bloomberg", "Wired"];

/* ── Reusable Components ────────────────────────────────── */

function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const isFloat = value % 1 !== 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * value;
      setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, value]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="flex overflow-hidden relative">
      <motion.div
        className="flex gap-16 items-center whitespace-nowrap"
        animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-base font-display font-bold text-muted-foreground/20 uppercase tracking-[0.25em] select-none">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="border-b border-border/30 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-7 text-left group"
      >
        <span className="text-lg font-display font-semibold text-foreground pr-4 group-hover:text-primary transition-colors">{q}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border border-border/50 shrink-0 transition-all duration-300 ${open ? "bg-primary border-primary rotate-180" : "group-hover:border-primary/50"}`}>
          <ChevronDown className={`h-4 w-4 transition-colors ${open ? "text-primary-foreground" : "text-muted-foreground"}`} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-7 text-base text-muted-foreground leading-relaxed max-w-2xl">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Curvy Underline Heading ── */
function CurvyHeading({ children, className = "", variant = "green" }: {
  children: React.ReactNode; className?: string; variant?: "green" | "purple" | "gold";
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const variantClass = variant === "purple" ? "curvy-underline curvy-underline-purple" : variant === "gold" ? "curvy-underline curvy-underline-gold" : "curvy-underline";

  return (
    <span ref={ref} className={`${isInView ? variantClass : ""} ${className}`}>
      {children}
    </span>
  );
}

/* ── Main Landing Page ──────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.92]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("avatar_url").eq("user_id", user.id).single().then(({ data }) => {
      if (data?.avatar_url) setProfileAvatarUrl(data.avatar_url);
    });
  }, [user]);

  const handleCheckout = async (priceId: string | null) => {
    if (!priceId) { navigate("/auth"); return; }
    if (!user) { navigate("/auth"); return; }
    setCheckoutLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to start checkout", variant: "destructive" });
    } finally {
      setCheckoutLoading(null);
    }
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = ["Features", "How It Works", "Pricing", "Reviews"];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ═══════════ NAVBAR ═══════════ */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-2xl border-b border-border/20 shadow-sm"
            : "backdrop-blur-none border-b border-transparent"
        }`}
        style={{ background: scrolled ? "hsl(var(--background) / 0.85)" : "transparent" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <img src={logoImg} alt="FinAI" className="h-14 w-14 rounded-xl group-hover:scale-110 transition-transform duration-300 dark:brightness-0 dark:invert" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-muted/30"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                  {profileAvatarUrl ? (
                    <img src={profileAvatarUrl} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    (user.email?.charAt(0) ?? "U").toUpperCase()
                  )}
                </div>
                <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-neon-green-light rounded-full px-6 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-neon-green-light rounded-full px-6 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    Get Started <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border/30"
            >
              {mobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/20 overflow-hidden"
              style={{ background: "hsl(var(--background) / 0.95)" }}
            >
              <div className="px-6 py-4 space-y-1">
                {navLinks.map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                    onClick={() => setMobileMenu(false)}
                    className="block py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ═══════════ HERO ═══════════ */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center pt-20 pb-10 overflow-hidden">
        <Scene3D />

        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />
          <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-64 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute top-0 left-0 w-1/4 sm:w-1/3 h-full bg-gradient-to-r from-background/40 to-transparent" />
          <div className="absolute top-0 right-0 w-1/4 sm:w-1/3 h-full bg-gradient-to-l from-background/40 to-transparent" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6"
        >
          {/* Floating badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border/30 backdrop-blur-xl text-[10px] sm:text-xs font-medium"
              style={{ background: "hsl(var(--card) / 0.6)" }}
            >
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">AI-Powered Finance</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/30 backdrop-blur-xl text-xs font-medium"
              style={{ background: "hsl(var(--card) / 0.6)" }}
            >
              <Star className="h-3 w-3 text-amber fill-amber" />
              <span className="text-muted-foreground">Rated 4.9/5</span>
            </motion.div>
          </div>

          {/* ── HEADLINE ── */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={0}
            className="font-display text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] xl:text-[8rem] font-bold leading-[0.85] mb-6 sm:mb-8 tracking-[-0.04em]"
          >
            <span className="text-foreground block text-echo" data-text="Your Money,">Your Money,</span>
            <span className="block relative">
              <span className="inline-block curvy-underline curvy-underline-loop">
                {"Reimagined.".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    className="inline-block gradient-text-hero"
                    animate={{
                      opacity: [0, 1, 1, 0.7],
                      y: [20, 0, 0, 2],
                    }}
                    transition={{
                      duration: 3.8,
                      repeat: Infinity,
                      delay: i * 0.06,
                      times: [0, 0.2, 0.8, 1],
                      ease: "easeInOut",
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-md sm:max-w-xl mx-auto mb-8 sm:mb-12 leading-relaxed font-light px-2"
          >
            Track expenses, crush goals, and build wealth with an AI coach
            that <span className="text-foreground font-semibold">actually gets you</span>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center"
          >
            <Link to="/auth">
              <Button size="lg" className="gap-2 sm:gap-2.5 px-6 sm:px-10 text-sm sm:text-base bg-primary text-primary-foreground hover:bg-neon-green-light rounded-full glow-green h-12 sm:h-14 font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02] w-full sm:w-auto">
                Start Free — No Card Needed <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="ghost" size="lg" className="gap-2 px-6 text-sm sm:text-base text-muted-foreground hover:text-foreground rounded-full h-12 sm:h-14 group">
                <Play className="h-4 w-4 group-hover:text-primary transition-colors" /> Watch Demo
              </Button>
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={5}
            className="mt-10 sm:mt-16 flex flex-col items-center gap-3 sm:gap-4"
          >
            <div className="flex -space-x-2 sm:-space-x-3">
              {[avatarSarah, avatarMarcus, avatarAisha, avatarJames, avatarLisa].map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 sm:border-[3px] border-background overflow-hidden shadow-lg"
                  style={{ zIndex: 5 - i }}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </motion.div>
              ))}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Trusted by <span className="text-foreground font-bold">50,000+</span> people worldwide
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 hidden sm:flex"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ TRUSTED BY MARQUEE ═══════════ */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 border-y border-border/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50 mb-6 sm:mb-8 font-semibold">As Featured In</p>
          <MarqueeRow items={trustedBy} />
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center group"
              >
                <p className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-text-primary mb-1 sm:mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix || ""} />
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.15em] font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PROBLEM / SOLUTION ═══════════ */}
      <section className="py-16 sm:py-28 px-4 sm:px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-destructive/20 text-[10px] uppercase tracking-[0.2em] text-destructive font-semibold mb-4 sm:mb-6 bg-destructive/5">
              <CircleDot className="h-3 w-3" /> The Problem
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-foreground tracking-tight leading-[0.95]">
              Managing money shouldn't<br className="hidden sm:block" /> be{" "}
              <CurvyHeading variant="purple">this hard</CurvyHeading>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {painPoints.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group relative glass-card p-5 sm:p-7 hover:border-primary/20 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 w-0 group-hover:w-full h-[1px] bg-gradient-to-r from-primary/60 to-transparent transition-all duration-700" />
                <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">{p.emoji}</span>
                <p className="text-sm sm:text-base font-medium text-muted-foreground/60 line-through decoration-destructive/30 mb-2 sm:mb-3">{p.problem}</p>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">{p.solution}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ VIDEO SHOWCASE ═══════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-4 sm:mb-6 bg-primary/5">
              <Eye className="h-3 w-3" /> See It In Action
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-foreground tracking-tight leading-[0.95]">
              Beautiful by{" "}
              <CurvyHeading variant="gold">design</CurvyHeading>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative group"
          >
            <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-border/30 shadow-2xl">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b border-border/20" style={{ background: "hsl(var(--card))" }}>
                <div className="flex gap-1 sm:gap-1.5">
                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-destructive/60" />
                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-amber/60" />
                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-primary/60" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 rounded-lg bg-muted/30 text-[10px] sm:text-xs text-muted-foreground max-w-[160px] sm:max-w-[200px]">
                    <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span>app.finai.com</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <video autoPlay loop muted playsInline className="w-full h-auto" src="/videos/Design-2.mp4" />
              </div>
            </div>

            {/* Floating accents - hidden on mobile/tablet */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -left-4 top-1/4 glass-card px-3 sm:px-4 py-2 sm:py-3 rounded-xl hidden xl:flex items-center gap-3 shadow-xl"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Monthly Savings</p>
                <p className="text-sm sm:text-base font-bold text-foreground">+$420.00</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, type: "spring" }}
              className="absolute -right-4 bottom-1/3 glass-card px-3 sm:px-4 py-2 sm:py-3 rounded-xl hidden xl:flex items-center gap-3 shadow-xl"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-electric-purple/10">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-electric-purple" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">AI Insight</p>
                <p className="text-sm sm:text-base font-bold text-foreground">Cut 3 subs</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FEATURES — REVOLUT-STYLE CARDS ═══════════ */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        {/* 3D Background - hidden on mobile for performance */}
        <div className="absolute inset-0 pointer-events-none opacity-30 hidden md:block">
          <Scene3DFeatures />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12 sm:mb-20"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-4 sm:mb-6 bg-primary/5">
              <Layers className="h-3 w-3" /> Features
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-5 text-foreground tracking-tight leading-[0.95] text-echo" data-text="Everything to master your money">
              Everything to{" "}
              <CurvyHeading variant="green">master your money</CurvyHeading>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base lg:text-lg px-2">
              Six powerful tools working together for complete financial clarity.
            </p>
          </motion.div>

          {/* Revolut-style bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={scaleIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                custom={i}
                className={`revolut-card ${f.cardClass} p-6 sm:p-8 min-h-[200px] sm:min-h-[240px] flex flex-col justify-between group cursor-pointer`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <f.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 bg-white/5">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:translate-x-1 transition-transform duration-300">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{f.desc}</p>
                </div>

                <div className="relative z-10 mt-4 sm:mt-6 flex items-center gap-1.5 text-xs text-white/80 font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Explore <ArrowUpRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-20 sm:py-32 px-4 sm:px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12 sm:mb-20"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber/20 text-[10px] uppercase tracking-[0.2em] text-amber font-semibold mb-4 sm:mb-6 bg-amber/5">
              <Zap className="h-3 w-3" /> How It Works
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-5 text-foreground tracking-tight leading-[0.95]">
              Three steps to{" "}
              <CurvyHeading variant="green">financial freedom</CurvyHeading>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-md mx-auto px-2">
              No complicated setup. No bank linking required. Just sign up and start.
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-28 left-[16%] right-[16%] h-px">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-border to-transparent" />
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/60 to-primary/0"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.3 }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 md:gap-8">
              {[
                { step: "01", icon: Smartphone, title: "Set Your Goals", desc: "Tell us your dreams — travel, gadgets, retirement. AI creates a personalized savings plan instantly.", gradient: "revolut-card-green" },
                { step: "02", icon: Zap, title: "AI Tracks Everything", desc: "Add expenses manually or scan receipts. AI categorizes, detects patterns, and finds savings automatically.", gradient: "revolut-card-amber" },
                { step: "03", icon: Globe, title: "Achieve & Celebrate", desc: "Watch real-time progress with predictive forecasts. Earn achievements and share milestones.", gradient: "revolut-card-purple" },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.7 }}
                  className="text-center relative group"
                >
                  <div className="relative inline-block mb-6 sm:mb-8">
                    <div className={`revolut-card ${s.gradient} flex h-18 w-18 sm:h-24 sm:w-24 items-center justify-center rounded-2xl sm:rounded-3xl mx-auto shadow-xl group-hover:shadow-2xl`}>
                      <s.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 font-display text-[10px] sm:text-xs font-bold bg-background text-foreground border-2 border-border rounded-full h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center shadow-sm">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 sm:mb-3">{s.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[280px] mx-auto">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-4 sm:mb-6 bg-primary/5">
              <Wallet className="h-3 w-3" /> Pricing
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-5 text-foreground tracking-tight leading-[0.95]">
              Simple,{" "}
              <CurvyHeading variant="green">transparent</CurvyHeading>{" "}
              pricing
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">Start free. Upgrade when you need more.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${
                  plan.popular
                    ? "revolut-card-green shadow-2xl sm:scale-[1.02] md:scale-105 sm:col-span-2 md:col-span-1"
                    : "glass-card hover:border-border"
                }`}
              >
                {!plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
                )}

                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-display text-lg sm:text-xl font-bold ${plan.popular ? "text-white" : "text-foreground"}`}>{plan.name}</h3>
                    {plan.popular && (
                      <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold bg-white/20 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-3 sm:mt-4 mb-6 sm:mb-8">
                    <span className={`font-display text-4xl sm:text-5xl font-bold ${plan.popular ? "text-white" : "text-foreground"}`}>{plan.price}</span>
                    <span className={`text-sm sm:text-base ${plan.popular ? "text-white/70" : "text-muted-foreground"}`}>{plan.period}</span>
                  </div>

                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm ${plan.popular ? "text-white/90" : "text-muted-foreground"}`}>
                        <div className={`flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full shrink-0 ${plan.popular ? "bg-white/20" : "bg-primary/10"}`}>
                          <Check className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${plan.popular ? "text-white" : "text-primary"}`} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleCheckout(plan.priceId)}
                    disabled={checkoutLoading === plan.priceId}
                    className={`w-full rounded-2xl h-11 sm:h-13 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "bg-white text-black hover:bg-white/90 shadow-lg hover:shadow-xl"
                        : "bg-muted/30 text-foreground hover:bg-muted/50 border border-border/30"
                    }`}
                  >
                    {checkoutLoading === plan.priceId ? "Loading..." : plan.cta}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section id="reviews" className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-electric-purple/[0.02] rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-electric-purple/20 text-[10px] uppercase tracking-[0.2em] text-electric-purple font-semibold mb-4 sm:mb-6 bg-electric-purple/5">
              <Heart className="h-3 w-3" /> Testimonials
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-5 text-foreground tracking-tight leading-[0.95]">
              Loved by{" "}
              <CurvyHeading variant="purple">thousands</CurvyHeading>
            </h2>

            {/* Trusted-by avatars */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-3 mt-8"
            >
              <div className="flex items-center -space-x-3">
                {[avatarSarah, avatarMarcus, avatarAisha, avatarJames, avatarLisa].map((src, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-[3px] border-background overflow-hidden shadow-lg"
                    style={{ zIndex: 5 - i }}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Trusted by <span className="font-bold text-foreground">50,000+</span> people worldwide
              </p>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className={`relative group rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-xl ${i === 2 ? "sm:col-span-2 md:col-span-1" : ""}`}
                style={{ background: "hsl(var(--card) / 0.8)" }}
              >
                {/* Top gradient border */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-6 sm:p-8">
                  {/* Star rating */}
                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 text-amber fill-amber" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm sm:text-[15px] text-foreground/80 leading-relaxed mb-8 min-h-[80px]">
                    "{t.text}"
                  </p>

                  {/* Author row */}
                  <div className="flex items-center justify-between pt-5 border-t border-border/20">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl overflow-hidden shadow-md ring-2 ring-primary/10">
                        <img src={t.avatar} alt={t.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-[11px] text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold gradient-text-primary">{t.saved}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">saved</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber/20 text-[10px] uppercase tracking-[0.2em] text-amber font-semibold mb-4 sm:mb-6 bg-amber/5">
              <MousePointer2 className="h-3 w-3" /> FAQ
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-foreground tracking-tight leading-[0.95]">
              Questions?{" "}
              <CurvyHeading variant="gold">Answers.</CurvyHeading>
            </h2>
          </motion.div>

          <div>
            {faqs.map((faq, i) => (
              <FAQItem key={i} {...faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-electric-purple/5 rounded-2xl sm:rounded-[2.5rem] blur-xl" />

          <div className="relative revolut-card-green p-8 sm:p-14 md:p-20 text-center rounded-2xl sm:rounded-[2.5rem] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="flex h-14 w-14 sm:h-18 sm:w-18 items-center justify-center rounded-2xl sm:rounded-3xl bg-white/15 mx-auto mb-6 sm:mb-8 backdrop-blur-sm"
            >
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </motion.div>

            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-5 tracking-tight leading-[0.95]">
              Ready to take control<br className="hidden sm:block" /> of your money?
            </h2>
            <p className="text-white/80 max-w-md mx-auto mb-8 sm:mb-12 text-sm sm:text-base lg:text-lg px-2">
              Join 50,000+ users building wealth with AI. Free forever — upgrade anytime.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center relative z-10">
              <Link to="/auth">
                <Button size="lg" className="gap-2 sm:gap-2.5 px-8 sm:px-12 text-sm sm:text-base bg-white text-black hover:bg-white/90 rounded-full h-12 sm:h-14 font-bold shadow-2xl transition-all duration-300 hover:scale-[1.02] w-full sm:w-auto">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-white/60 mt-6 sm:mt-8 flex items-center justify-center gap-2">
              <Fingerprint className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Bank-grade security · No credit card required
            </p>
          </div>
        </motion.div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-border/15 py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 mb-10 sm:mb-14">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                <img src={logoImg} alt="FinAI" className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl dark:brightness-0 dark:invert" />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[280px] mb-5 sm:mb-6">
                The AI-powered financial coach helping you save smarter, spend wiser, and achieve more.
              </p>
              <div className="flex items-center gap-2.5 sm:gap-3">
                {["X", "In", "GH"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-border/30 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Security", "Changelog"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies", "GDPR"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-5">{col.title}</p>
                <ul className="space-y-2 sm:space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border/15 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">© 2026 FinAI. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
              Made with <Heart className="h-3 w-3 text-destructive fill-destructive mx-0.5" /> by the FinAI team
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
