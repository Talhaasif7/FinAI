import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Target, Brain, TrendingUp, CreditCard,
  Shield, Zap, BarChart3, Sparkles, Star,
  ChevronRight, Globe, Smartphone, Lock, ArrowUpRight,
  Wallet, PieChart, Bell, Award
} from "lucide-react";
import { Scene3D, Scene3DFeatures } from "@/components/Scene3D";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoImg from "@/assets/logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] } }),
};

const features = [
  { icon: Target, title: "Smart Goals", desc: "AI calculates weekly savings, spending limits, and goal probability in real-time.", color: "from-neon-green to-cyan" },
  { icon: Brain, title: "AI Financial Coach", desc: "Personal assistant that analyzes spending patterns and recommends optimizations.", color: "from-electric-purple to-magenta" },
  { icon: BarChart3, title: "Deep Insights", desc: "Understand your habits with AI-powered analytics, predictions, and spending scores.", color: "from-amber to-coral" },
  { icon: CreditCard, title: "Subscription Tracker", desc: "Detect and manage recurring payments. AI suggests which subscriptions to cancel.", color: "from-magenta to-electric-purple" },
  { icon: TrendingUp, title: "Predictive Forecasts", desc: "Cash flow predictions and goal success probability based on your actual habits.", color: "from-cyan to-neon-green" },
  { icon: Shield, title: "Bank-Grade Security", desc: "End-to-end encryption, 2FA, and full compliance with financial regulations.", color: "from-neon-green to-electric-purple" },
];

const stats = [
  { value: "50K+", label: "Active Users", icon: Wallet },
  { value: "$2.4M", label: "Goals Achieved", icon: Award },
  { value: "94%", label: "Success Rate", icon: PieChart },
  { value: "4.9★", label: "App Rating", icon: Star },
];

const testimonials = [
  { name: "Sarah K.", role: "Freelancer", text: "FinAI helped me save $3,200 in 3 months for my Japan trip. The AI insights are incredibly accurate.", avatar: "SK" },
  { name: "Marcus T.", role: "Software Engineer", text: "I never realized how much I was spending on subscriptions. FinAI saved me $80/month instantly!", avatar: "MT" },
  { name: "Aisha R.", role: "Graduate Student", text: "The gamification keeps me motivated. I've been on a 45-day savings streak!", avatar: "AR" },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.9]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b border-border/20"
        style={{ background: "hsl(var(--background) / 0.75)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="FinAI" className="h-7 w-7 rounded-lg" />
            <span className="font-display text-base font-bold gradient-text-primary">FinAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Reviews"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-300">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link to="/dashboard">
              <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-neon-green-light rounded-full px-5 text-xs h-8">
                Get Started <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[110vh] flex items-center justify-center pt-14 overflow-hidden">
        <Scene3D />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 text-center max-w-5xl mx-auto px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 rounded-full"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-medium text-muted-foreground">AI-Powered Finance · Trusted by 50K+ Users</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="font-display text-5xl sm:text-6xl md:text-8xl font-bold leading-[0.95] mb-6 tracking-tight"
          >
            <span className="text-foreground">Your Money,</span>
            <br />
            <span className="gradient-text-hero">Reimagined.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The AI financial coach that tracks, predicts, and optimizes your money.
            Set goals, crush spending habits, and build wealth — effortlessly.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="flex flex-col sm:flex-row items-center gap-3 justify-center"
          >
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 px-10 text-sm bg-primary text-primary-foreground hover:bg-neon-green-light rounded-full glow-green h-12">
                Start Free Today <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="gap-2 px-8 text-sm border-border/50 text-foreground hover:bg-muted/30 rounded-full h-12">
                Explore Features <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-3.5 rounded-2xl text-center group hover:glow-green transition-all duration-300">
                <stat.icon className="h-3.5 w-3.5 mx-auto mb-1.5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                <p className="font-display text-lg md:text-xl font-bold gradient-text-primary">{stat.value}</p>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Video showcase */}
      <section className="py-16 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold">See It In Action</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold mt-2 text-foreground">
              Beautiful by <span className="gradient-text-gold">design</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative rounded-2xl overflow-hidden border border-border/30 glow-green"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent z-10 pointer-events-none" />
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto"
              src="/videos/Design-2.mp4"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Scene3DFeatures />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold">Features</span>
            <h2 className="font-display text-2xl md:text-5xl font-bold mt-2 mb-4 text-foreground leading-tight">
              Everything to{" "}
              <span className="gradient-text-hero">master your money</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              Intelligent tools working in harmony to give you total control over your financial future.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="group relative glass-card-hover p-6 rounded-2xl overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>

                <div className="mt-3 flex items-center gap-1 text-[11px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more <ArrowUpRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-amber font-semibold">How It Works</span>
            <h2 className="font-display text-2xl md:text-5xl font-bold mt-2 mb-3 text-foreground">
              Three steps to <span className="gradient-text-primary">freedom</span>
            </h2>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", icon: Smartphone, title: "Set Your Goals", desc: "Tell us your dreams — travel, gadgets, investments. We create a personalized savings plan.", gradient: "from-neon-green to-cyan" },
                { step: "02", icon: Zap, title: "AI Tracks & Optimizes", desc: "Our AI categorizes spending, detects patterns, and finds savings opportunities automatically.", gradient: "from-amber to-coral" },
                { step: "03", icon: Globe, title: "Achieve Dreams", desc: "Watch real-time progress with predictive forecasts. Celebrate milestones along the way.", gradient: "from-electric-purple to-magenta" },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.7 }}
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

      {/* Testimonials */}
      <section id="reviews" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-electric-purple font-semibold">Reviews</span>
            <h2 className="font-display text-2xl md:text-5xl font-bold mt-2 mb-3 text-foreground">
              Loved by <span className="gradient-text-hero">thousands</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="glass-card p-6 rounded-2xl group hover:glow-purple transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 text-amber fill-amber" />
                  ))}
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-electric-purple flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-electric-purple/8" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="relative z-10 glass-surface p-10 md:p-16 text-center rounded-3xl border-border/20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Bell className="h-7 w-7 mx-auto mb-5 text-primary" />
              <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                Ready to take control?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-sm">
                Join 50,000+ users saving smarter with AI. Start free — no credit card required.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 px-10 text-sm bg-primary text-primary-foreground hover:bg-neon-green-light glow-green rounded-full h-12">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="FinAI" className="h-6 w-6 rounded-lg" />
            <span className="font-display text-sm font-bold gradient-text-primary">FinAI</span>
          </div>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact", "Blog"].map((item) => (
              <a key={item} href="#" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">© 2026 FinAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
