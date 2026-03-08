import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Target, Brain, TrendingUp, CreditCard, 
  Shield, Zap, BarChart3, Sparkles, Star, 
  ChevronRight, Globe, Smartphone, Lock
} from "lucide-react";
import { Scene3D } from "@/components/Scene3D";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoImg from "@/assets/logo.png";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

const features = [
  { icon: Target, title: "Smart Goals", desc: "AI calculates weekly savings, spending limits, and goal probability in real-time.", color: "text-primary", bg: "bg-primary/10" },
  { icon: Brain, title: "AI Coach", desc: "Personal financial assistant that analyzes spending and recommends optimizations.", color: "text-secondary", bg: "bg-secondary/10" },
  { icon: BarChart3, title: "Deep Insights", desc: "Understand your spending patterns with AI-powered analytics and predictions.", color: "text-lavender", bg: "bg-lavender/10" },
  { icon: CreditCard, title: "Subscription Tracker", desc: "Detect and manage recurring payments. AI suggests which to cancel.", color: "text-coral", bg: "bg-coral/10" },
  { icon: TrendingUp, title: "Predictive Forecasts", desc: "Cash flow predictions and goal success probability based on your habits.", color: "text-primary", bg: "bg-primary/10" },
  { icon: Shield, title: "Bank-Grade Security", desc: "End-to-end encryption, 2FA, and full compliance with financial regulations.", color: "text-secondary", bg: "bg-secondary/10" },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "$2.4M", label: "Goals Achieved" },
  { value: "94%", label: "Success Rate" },
  { value: "4.9★", label: "App Rating" },
];

const testimonials = [
  { name: "Sarah K.", role: "Freelancer", text: "FinAI helped me save $3,200 in 3 months for my Japan trip. The AI insights are incredibly accurate.", rating: 5 },
  { name: "Marcus T.", role: "Engineer", text: "I never realized how much I was spending on subscriptions until FinAI showed me. Saved $80/month!", rating: 5 },
  { name: "Aisha R.", role: "Student", text: "The gamification keeps me motivated. I've been on a 45-day savings streak now!", rating: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-border/40" style={{ background: "hsla(220, 20%, 4%, 0.8)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="FinAI" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-lg font-bold gradient-text-primary">FinAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
          </div>
          <Link to="/dashboard">
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-teal-light">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <Scene3D />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
        
        <motion.div 
          variants={container} initial="hidden" animate="show"
          className="relative z-10 text-center max-w-4xl mx-auto px-6"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Powered by AI · Trusted by 50K+ Users</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            Your Money,{" "}
            <span className="gradient-text-hero">Smarter.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            AI-powered financial coach that tracks expenses, predicts goals, and optimizes your spending — so you can achieve your dreams faster.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 px-8 text-base bg-primary text-primary-foreground hover:bg-teal-light shadow-lg glow-teal">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="gap-2 px-8 text-base border-border text-foreground hover:bg-muted/30">
                See Features <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl md:text-3xl font-bold gradient-text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">Features</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4 text-foreground">
              Everything you need to <span className="gradient-text-gold">master your money</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Intelligent tools that work together to give you complete control over your financial future.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card-hover p-6 group"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.bg} mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-secondary font-semibold">How It Works</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4 text-foreground">
              Three steps to <span className="gradient-text-primary">financial freedom</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Smartphone, title: "Set Your Goals", desc: "Tell us what you want to achieve — travel, gadgets, investments. We'll build a personalized plan." },
              { step: "02", icon: Zap, title: "Track & Optimize", desc: "AI automatically categorizes spending, detects patterns, and suggests savings opportunities." },
              { step: "03", icon: Globe, title: "Achieve Dreams", desc: "Watch your progress in real-time with predictive forecasts and celebrate milestones." },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="text-6xl font-display font-bold gradient-text-primary opacity-20 mb-4">{s.step}</div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-lavender font-semibold">Reviews</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-3 mb-4 text-foreground">
              Loved by <span className="gradient-text-hero">thousands</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-secondary fill-secondary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-surface p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Join 50,000+ users who are saving smarter with AI. Start free today — no credit card required.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="gap-2 px-10 text-base bg-primary text-primary-foreground hover:bg-teal-light glow-teal">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="FinAI" className="h-7 w-7 rounded-md" />
            <span className="font-display text-sm font-bold gradient-text-primary">FinAI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 FinAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
