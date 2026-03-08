import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Target, Brain, TrendingUp, CreditCard,
  Shield, Zap, BarChart3, Star, Receipt,
  ChevronRight, Globe, Smartphone, ArrowUpRight,
  Wallet, PieChart, Bell, Award, Check, Flame,
  Bot, Trophy, Camera, ChevronDown, Users,
  LineChart, Sparkles, Lock, Eye, Heart
} from "lucide-react";
import { Scene3D, Scene3DFeatures } from "@/components/Scene3D";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoImg from "@/assets/logo.png";

/* ── Animations ─────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

/* ── Data ───────────────────────────────────────────────── */
const features = [
  { icon: Target, title: "Smart Goals", desc: "AI-powered savings plans with dynamic adjustments based on your real spending behavior.", color: "from-neon-green to-cyan", tag: "Goals" },
  { icon: Brain, title: "AI Financial Coach", desc: "Conversational AI that answers questions, gives advice, and finds savings opportunities.", color: "from-electric-purple to-magenta", tag: "AI" },
  { icon: BarChart3, title: "Deep Analytics", desc: "Spending personality analysis, forecasts, and financial health scores updated in real-time.", color: "from-amber to-coral", tag: "Insights" },
  { icon: CreditCard, title: "Subscription Manager", desc: "Auto-detect recurring charges. Get alerts before renewals and find subscriptions to cut.", color: "from-cyan to-neon-green", tag: "Subs" },
  { icon: Camera, title: "Receipt Scanner", desc: "Snap a photo of any receipt. AI extracts merchant, amount, items, and categorizes instantly.", color: "from-magenta to-electric-purple", tag: "OCR" },
  { icon: Trophy, title: "Gamification", desc: "Earn achievements, maintain streaks, and compete in weekly savings challenges.", color: "from-neon-green to-electric-purple", tag: "Fun" },
];

const stats = [
  { value: "50K+", label: "Active Users", icon: Users },
  { value: "$2.4M", label: "Goals Achieved", icon: Award },
  { value: "94%", label: "Success Rate", icon: PieChart },
  { value: "4.9★", label: "App Rating", icon: Star },
];

const testimonials = [
  { name: "Sarah K.", role: "Freelancer", text: "FinAI helped me save $3,200 in 3 months for my Japan trip. The AI insights are incredibly accurate and the gamification keeps me hooked.", avatar: "SK", saved: "$3,200" },
  { name: "Marcus T.", role: "Software Engineer", text: "I never realized how much I was spending on subscriptions. FinAI identified 6 unused subscriptions and saved me $80/month instantly!", avatar: "MT", saved: "$960/yr" },
  { name: "Aisha R.", role: "Graduate Student", text: "The receipt scanner is a game-changer. I just snap a photo and everything is tracked. I've been on a 45-day savings streak!", avatar: "AR", saved: "$1,800" },
];

const painPoints = [
  { emoji: "😰", problem: "No idea where money goes", solution: "AI auto-categorizes every transaction" },
  { emoji: "📊", problem: "Spreadsheets are tedious", solution: "Beautiful dashboards that update in real-time" },
  { emoji: "🎯", problem: "Goals feel impossible", solution: "AI calculates exactly how much to save weekly" },
  { emoji: "💳", problem: "Forgotten subscriptions", solution: "Auto-detect and alert before every renewal" },
];

const pricingPlans = [
  { name: "Free", price: "$0", period: "forever", features: ["5 goals", "50 expenses/mo", "Basic insights", "Receipt scanner"], cta: "Start Free", popular: false },
  { name: "Pro", price: "$9", period: "/month", features: ["Unlimited goals", "Unlimited expenses", "AI Coach access", "Advanced analytics", "Weekly AI reports", "Priority support"], cta: "Start Pro Trial", popular: true },
  { name: "Team", price: "$19", period: "/month", features: ["Everything in Pro", "Shared family goals", "Multi-user access", "Export reports", "API access", "Custom categories"], cta: "Contact Sales", popular: false },
];

const faqs = [
  { q: "Is FinAI really free?", a: "Yes! The free plan includes goal tracking, expense management, basic insights, and receipt scanning. Upgrade for unlimited access and AI coaching." },
  { q: "How does the AI work?", a: "FinAI uses advanced language models to analyze your spending patterns, predict future expenses, and generate personalized saving strategies — no manual setup needed." },
  { q: "Is my financial data secure?", a: "Absolutely. We use bank-grade encryption (AES-256), never store raw bank credentials, and comply with SOC 2 and GDPR standards." },
  { q: "Can I export my data?", a: "Yes. Pro and Team plans can export to CSV, PDF, or connect via API. Your data belongs to you, always." },
];

/* ── Animated counter ───────────────────────────────────── */
function AnimatedStat({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="glass-card p-4 rounded-2xl text-center group hover:glow-green transition-all duration-300"
    >
      <Icon className="h-4 w-4 mx-auto mb-2 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
      <p className="font-display text-xl md:text-2xl font-bold gradient-text-primary">{value}</p>
      <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  );
}

/* ── FAQ Accordion ──────────────────────────────────────── */
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="text-sm font-medium text-foreground pr-4">{q}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Landing Page ──────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.92]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ═══════════ NAVBAR ═══════════ */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b border-border/15"
        style={{ background: "hsl(var(--background) / 0.8)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoImg} alt="FinAI" className="h-7 w-7 rounded-lg" />
            <span className="font-display text-base font-bold gradient-text-primary">FinAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Pricing", "Reviews"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link to="/auth" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-xs h-8 text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-neon-green-light rounded-full px-5 text-xs h-8">
                Get Started <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ═══════════ HERO ═══════════ */}
      <section ref={heroRef} className="relative min-h-[105vh] flex items-center justify-center pt-14 overflow-hidden">
        <Scene3D />

        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 text-center max-w-5xl mx-auto px-6"
        >
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 rounded-full"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-medium text-muted-foreground">AI-Powered Finance · Trusted by 50K+ Users</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={0}
            className="font-display text-5xl sm:text-6xl md:text-[5.5rem] font-bold leading-[0.92] mb-6 tracking-tight"
          >
            <span className="text-foreground">Your Money,</span>
            <br />
            <span className="gradient-text-hero">Reimagined.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Track expenses, crush goals, and build wealth with the AI financial coach
            that <span className="text-foreground font-medium">actually understands</span> your spending.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="flex flex-col sm:flex-row items-center gap-3 justify-center"
          >
            <Link to="/auth">
              <Button size="lg" className="gap-2 px-10 text-sm bg-primary text-primary-foreground hover:bg-neon-green-light rounded-full glow-green h-12">
                Start Free — No Card Required <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="gap-2 px-8 text-sm border-border/40 text-foreground hover:bg-muted/20 rounded-full h-12">
                See How It Works <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={5}
            className="mt-14 flex flex-col items-center gap-3"
          >
            <div className="flex -space-x-2">
              {["SK", "MT", "AR", "JD", "LW"].map((initials, i) => (
                <div key={initials} className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-electric-purple flex items-center justify-center text-[9px] font-bold text-primary-foreground" style={{ zIndex: 5 - i }}>
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Join <span className="text-foreground font-semibold">50,000+</span> people managing money smarter
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section className="py-8 px-6 relative -mt-20 z-20">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      {/* ═══════════ PROBLEM / SOLUTION ═══════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-destructive font-semibold">The Problem</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold mt-2 text-foreground">
              Managing money shouldn't be <span className="gradient-text-purple">this hard</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {painPoints.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card p-5 flex items-start gap-4 group hover:border-primary/20 transition-all duration-300"
              >
                <span className="text-2xl mt-0.5">{p.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground line-through decoration-destructive/40">{p.problem}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    <p className="text-sm font-medium text-foreground">{p.solution}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ VIDEO SHOWCASE ═══════════ */}
      <section className="py-16 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold">See It In Action</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold mt-2 text-foreground">
              Beautiful by <span className="gradient-text-gold">design</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative rounded-2xl overflow-hidden border border-border/30 glow-green"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent z-10 pointer-events-none" />
            <video autoPlay loop muted playsInline className="w-full h-auto" src="/videos/Design-2.mp4" />
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FEATURES BENTO ═══════════ */}
      <section id="features" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <Scene3DFeatures />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold">Features</span>
            <h2 className="font-display text-2xl md:text-5xl font-bold mt-2 mb-3 text-foreground leading-tight">
              Everything to <span className="gradient-text-hero">master your money</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Six powerful tools that work together to give you complete financial clarity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                className="group relative glass-card-hover p-6 rounded-2xl overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
                    <f.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold bg-muted/50 px-2 py-0.5 rounded-full">{f.tag}</span>
                </div>

                <h3 className="font-display text-base font-semibold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>

                <div className="mt-4 flex items-center gap-1 text-[11px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore <ArrowUpRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-amber font-semibold">How It Works</span>
            <h2 className="font-display text-2xl md:text-5xl font-bold mt-2 mb-3 text-foreground">
              Three steps to <span className="gradient-text-primary">financial freedom</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">No complicated setup. No bank linking required. Just sign up and start tracking.</p>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", icon: Smartphone, title: "Set Your Goals", desc: "Tell us your dreams — travel, gadgets, retirement. AI creates a personalized savings plan instantly.", gradient: "from-neon-green to-cyan" },
                { step: "02", icon: Zap, title: "AI Tracks Everything", desc: "Add expenses manually or scan receipts. AI categorizes, detects patterns, and finds savings automatically.", gradient: "from-amber to-coral" },
                { step: "03", icon: Globe, title: "Achieve & Celebrate", desc: "Watch real-time progress with predictive forecasts. Earn achievements and share milestones.", gradient: "from-electric-purple to-magenta" },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="text-center relative group"
                >
                  <div className="relative inline-block mb-5">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} mx-auto shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <s.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 font-display text-[10px] font-bold bg-background text-foreground border border-border rounded-full h-6 w-6 flex items-center justify-center">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold">Pricing</span>
            <h2 className="font-display text-2xl md:text-5xl font-bold mt-2 mb-3 text-foreground">
              Simple, <span className="gradient-text-primary">transparent</span> pricing
            </h2>
            <p className="text-sm text-muted-foreground">Start free. Upgrade when you need more power.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`glass-card p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${
                  plan.popular ? "glow-green border-primary/30" : "hover:border-border/60"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-green to-cyan" />
                )}
                {plan.popular && (
                  <span className="absolute top-3 right-3 text-[9px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}

                <h3 className="font-display text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-5">
                  <span className="font-display text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to="/auth">
                  <Button
                    className={`w-full rounded-xl ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-neon-green-light"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section id="reviews" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-electric-purple font-semibold">Testimonials</span>
            <h2 className="font-display text-2xl md:text-5xl font-bold mt-2 mb-3 text-foreground">
              Loved by <span className="gradient-text-hero">thousands</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="glass-card p-6 rounded-2xl group hover:glow-purple transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 text-amber fill-amber" />
                  ))}
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-electric-purple flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold gradient-text-primary">{t.saved}</p>
                    <p className="text-[9px] text-muted-foreground">saved</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-amber font-semibold">FAQ</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold mt-2 text-foreground">
              Questions? <span className="gradient-text-gold">Answers.</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} {...faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="py-24 px-6 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-background to-electric-purple/6" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="relative z-10 glass-surface p-10 md:p-16 text-center rounded-3xl border-border/15">
            <Sparkles className="h-7 w-7 mx-auto mb-5 text-primary" />
            <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
              Ready to take control of your money?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm">
              Join 50,000+ users building wealth with AI. Free forever — upgrade anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Link to="/auth">
                <Button size="lg" className="gap-2 px-10 text-sm bg-primary text-primary-foreground hover:bg-neon-green-light glow-green rounded-full h-12">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3" /> Bank-grade security · No credit card required
            </p>
          </div>
        </motion.div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-border/20 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src={logoImg} alt="FinAI" className="h-6 w-6 rounded-lg" />
                <span className="font-display text-sm font-bold gradient-text-primary">FinAI</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                The AI-powered financial coach helping you save smarter, spend wiser, and achieve more.
              </p>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Security", "Changelog"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies", "GDPR"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold text-foreground mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-muted-foreground">© 2026 FinAI. All rights reserved.</p>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              Made with <Heart className="h-3 w-3 text-destructive mx-0.5" /> by the FinAI team
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
