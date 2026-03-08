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
  { icon: Target, title: "Smart Goals", desc: "AI calculates weekly savings, spending limits, and goal probability in real-time.", color: "from-teal to-teal-light" },
  { icon: Brain, title: "AI Financial Coach", desc: "Personal assistant that analyzes spending patterns and recommends optimizations.", color: "from-lavender to-lavender" },
  { icon: BarChart3, title: "Deep Insights", desc: "Understand your habits with AI-powered analytics, predictions, and spending scores.", color: "from-gold to-gold-light" },
  { icon: CreditCard, title: "Subscription Tracker", desc: "Detect and manage recurring payments. AI suggests which subscriptions to cancel.", color: "from-coral to-coral" },
  { icon: TrendingUp, title: "Predictive Forecasts", desc: "Cash flow predictions and goal success probability based on your actual habits.", color: "from-teal to-teal-light" },
  { icon: Shield, title: "Bank-Grade Security", desc: "End-to-end encryption, 2FA, and full compliance with financial regulations.", color: "from-lavender to-lavender" },
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
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b border-border/30"
        style={{ background: "hsl(var(--background) / 0.7)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="FinAI" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-lg font-bold gradient-text-primary">FinAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Reviews"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/dashboard">
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-teal-light rounded-full px-5">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[110vh] flex items-center justify-center pt-16 overflow-hidden">
        <Scene3D />

        {/* Gradient overlays for depth */}
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
            className="inline-flex items-center gap-2 glass-card px-5 py-2.5 mb-8 rounded-full"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">AI-Powered Finance · Trusted by 50K+ Users</span>
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
            className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The AI financial coach that tracks, predicts, and optimizes your money.
            Set goals, crush spending habits, and build wealth — effortlessly.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center"
          >
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 px-10 text-base bg-primary text-primary-foreground hover:bg-teal-light rounded-full shadow-lg glow-teal h-13">
                Start Free Today <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="gap-2 px-8 text-base border-border/50 text-foreground hover:bg-muted/30 rounded-full h-13">
                Explore Features <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </motion.div>

          {/* Floating stats strip */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-4 rounded-2xl text-center group hover:glow-teal transition-all duration-300">
                <stat.icon className="h-4 w-4 mx-auto mb-2 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                <p className="font-display text-xl md:text-2xl font-bold gradient-text-primary">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Video showcase section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">See It In Action</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 text-foreground">
              Beautiful by <span className="gradient-text-gold">design</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative rounded-3xl overflow-hidden border border-border/40 glow-teal"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent z-10 pointer-events-none" />
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto"
              src="/videos/Design.mp4"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 px-6 relative overflow-hidden">
        {/* Subtle 3D background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <Scene3DFeatures />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">Features</span>
            <h2 className="font-display text-3xl md:text-6xl font-bold mt-3 mb-5 text-foreground leading-tight">
              Everything to{" "}
              <span className="gradient-text-hero">master your money</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              Intelligent tools working in harmony to give you total control over your financial future.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="group relative glass-card-hover p-7 rounded-2xl overflow-hidden"
              >
                {/* Top gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} mb-5 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>

                <div className="mt-4 flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more <ArrowUpRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">How It Works</span>
            <h2 className="font-display text-3xl md:text-6xl font-bold mt-3 mb-4 text-foreground">
              Three steps to <span className="gradient-text-primary">freedom</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { step: "01", icon: Smartphone, title: "Set Your Goals", desc: "Tell us your dreams — travel, gadgets, investments. We create a personalized savings plan.", gradient: "from-teal to-teal-light" },
                { step: "02", icon: Zap, title: "AI Tracks & Optimizes", desc: "Our AI categorizes spending, detects patterns, and finds savings opportunities automatically.", gradient: "from-gold to-gold-light" },
                { step: "03", icon: Globe, title: "Achieve Dreams", desc: "Watch real-time progress with predictive forecasts. Celebrate milestones along the way.", gradient: "from-lavender to-lavender" },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.7 }}
                  className="text-center relative group"
                >
                  <div className="relative inline-block mb-6">
                    <div className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${s.gradient} mx-auto shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <s.icon className="h-9 w-9 text-primary-foreground" />
                    </div>
                    <span className="absolute -top-2 -right-2 font-display text-xs font-bold bg-background text-foreground border border-border rounded-full h-7 w-7 flex items-center justify-center">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-28 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-lavender font-semibold">Reviews</span>
            <h2 className="font-display text-3xl md:text-6xl font-bold mt-3 mb-4 text-foreground">
              Loved by <span className="gradient-text-hero">thousands</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="glass-card p-7 rounded-2xl group hover:glow-lavender transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-lavender flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-lavender/10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="relative z-10 glass-surface p-12 md:p-20 text-center rounded-3xl border-border/30">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Bell className="h-8 w-8 mx-auto mb-6 text-primary" />
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
                Ready to take control?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-base">
                Join 50,000+ users saving smarter with AI. Start free — no credit card required.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 px-12 text-base bg-primary text-primary-foreground hover:bg-teal-light glow-teal rounded-full h-13">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="FinAI" className="h-7 w-7 rounded-md" />
            <span className="font-display text-sm font-bold gradient-text-primary">FinAI</span>
          </div>
          <div className="flex items-center gap-8">
            {["Privacy", "Terms", "Contact", "Blog"].map((item) => (
              <a key={item} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">© 2026 FinAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
