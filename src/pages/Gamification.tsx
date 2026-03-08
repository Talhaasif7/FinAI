import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Target, Zap, Medal, Star, Crown, Shield, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const ACHIEVEMENTS = [
  { key: "first_expense", title: "First Step", description: "Track your first expense", icon: Star, emoji: "⭐" },
  { key: "10_expenses", title: "Consistent Tracker", description: "Track 10 expenses", icon: Target, emoji: "🎯" },
  { key: "50_expenses", title: "Expense Master", description: "Track 50 expenses", icon: Crown, emoji: "👑" },
  { key: "first_goal", title: "Dream Big", description: "Create your first goal", icon: Medal, emoji: "🏅" },
  { key: "goal_50pct", title: "Halfway There", description: "Reach 50% of any goal", icon: Zap, emoji: "⚡" },
  { key: "goal_complete", title: "Goal Crusher", description: "Complete a financial goal", icon: Trophy, emoji: "🏆" },
  { key: "streak_7", title: "Week Warrior", description: "7-day tracking streak", icon: Flame, emoji: "🔥" },
  { key: "streak_30", title: "Monthly Legend", description: "30-day tracking streak", icon: Crown, emoji: "💎" },
  { key: "budget_set", title: "Budget Boss", description: "Set your first budget", icon: Shield, emoji: "🛡️" },
  { key: "5_subscriptions", title: "Sub Scanner", description: "Track 5 subscriptions", icon: Award, emoji: "📊" },
];

const CHALLENGES = [
  { id: "no_takeout", title: "No Takeout Week", description: "Don't order food delivery for 7 days", reward: "Save ~$50", emoji: "🍔", days: 7 },
  { id: "coffee_free", title: "Coffee Free Week", description: "Skip the coffee shop for 7 days", reward: "Save ~$30", emoji: "☕", days: 7 },
  { id: "no_impulse", title: "No Impulse Buys", description: "No purchases under $20 for 5 days", reward: "Save ~$40", emoji: "🛍️", days: 5 },
  { id: "savings_100", title: "$100 Savings Sprint", description: "Save $100 in one week", reward: "Boost goals", emoji: "💰", days: 7 },
];

const Gamification = forwardRef<HTMLDivElement>(function Gamification(_props, ref) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [unlockedKeys, setUnlockedKeys] = useState<Set<string>>(new Set());
  const [expenseCount, setExpenseCount] = useState(0);
  const [goalCount, setGoalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [streakRes, achieveRes, expRes, goalRes, subRes, budRes] = await Promise.all([
        supabase.from("user_streaks").select("*").eq("user_id", user.id).single(),
        supabase.from("user_achievements").select("*").eq("user_id", user.id),
        supabase.from("expenses").select("id", { count: "exact", head: true }),
        supabase.from("goals").select("*"),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }),
        supabase.from("budgets").select("id", { count: "exact", head: true }),
      ]);

      const currentStreak = streakRes.data || { current_streak: 0, longest_streak: 0 };
      setStreak(currentStreak);
      setUnlockedKeys(new Set((achieveRes.data || []).map(a => a.achievement_key)));
      setExpenseCount(expRes.count || 0);
      setGoalCount((goalRes.data || []).length);

      // Auto-unlock achievements
      const toUnlock: string[] = [];
      const count = expRes.count || 0;
      if (count >= 1) toUnlock.push("first_expense");
      if (count >= 10) toUnlock.push("10_expenses");
      if (count >= 50) toUnlock.push("50_expenses");
      if ((goalRes.data || []).length >= 1) toUnlock.push("first_goal");
      if ((goalRes.data || []).some((g: any) => Number(g.saved) / Number(g.target) >= 0.5)) toUnlock.push("goal_50pct");
      if ((goalRes.data || []).some((g: any) => Number(g.saved) >= Number(g.target))) toUnlock.push("goal_complete");
      if (currentStreak.current_streak >= 7) toUnlock.push("streak_7");
      if (currentStreak.current_streak >= 30) toUnlock.push("streak_30");
      if ((budRes.count || 0) >= 1) toUnlock.push("budget_set");
      if ((subRes.count || 0) >= 5) toUnlock.push("5_subscriptions");

      const existing = new Set((achieveRes.data || []).map(a => a.achievement_key));
      const newAchievements = toUnlock.filter(k => !existing.has(k));

      if (newAchievements.length > 0) {
        await supabase.from("user_achievements").insert(
          newAchievements.map(key => ({ user_id: user.id, achievement_key: key }))
        );
        newAchievements.forEach(key => {
          const a = ACHIEVEMENTS.find(a => a.key === key);
          if (a) toast({ title: `🎉 Achievement Unlocked!`, description: `${a.emoji} ${a.title}` });
        });
        setUnlockedKeys(new Set([...existing, ...newAchievements]));
      }

      setLoading(false);
    };
    load();
  }, [user]);

  const unlockedCount = unlockedKeys.size;
  const totalCount = ACHIEVEMENTS.length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <motion.div ref={ref} variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold text-foreground">Achievements & Challenges</h1>
        <p className="text-muted-foreground text-sm mt-1">Make saving money fun 🎮</p>
      </motion.div>

      {/* Streak + Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card glow-gold">
          <div className="flex items-center gap-2 mb-2"><Flame className="h-5 w-5 text-secondary" /><span className="text-[11px] text-muted-foreground uppercase tracking-wider">Current Streak</span></div>
          <p className="font-display text-3xl font-bold text-foreground">{streak.current_streak} <span className="text-base text-muted-foreground font-normal">days</span></p>
          {streak.current_streak >= 7 && <p className="text-xs text-secondary mt-1">🔥 You're on fire!</p>}
        </div>
        <div className="stat-card glow-teal">
          <div className="flex items-center gap-2 mb-2"><Trophy className="h-5 w-5 text-primary" /><span className="text-[11px] text-muted-foreground uppercase tracking-wider">Longest Streak</span></div>
          <p className="font-display text-3xl font-bold text-foreground">{streak.longest_streak} <span className="text-base text-muted-foreground font-normal">days</span></p>
        </div>
        <div className="stat-card glow-lavender">
          <div className="flex items-center gap-2 mb-2"><Medal className="h-5 w-5 text-lavender" /><span className="text-[11px] text-muted-foreground uppercase tracking-wider">Achievements</span></div>
          <p className="font-display text-3xl font-bold text-foreground">{unlockedCount}<span className="text-base text-muted-foreground font-normal">/{totalCount}</span></p>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
            <div className="h-full rounded-full bg-lavender transition-all duration-700" style={{ width: `${(unlockedCount / totalCount) * 100}%` }} />
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={item}>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">🏆 Achievements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = unlockedKeys.has(achievement.key);
            return (
              <div key={achievement.key} className={`glass-card p-4 flex items-center gap-3 transition-all duration-300 ${unlocked ? "glow-gold" : "opacity-50"}`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${unlocked ? "bg-secondary/10" : "bg-muted/30"}`}>
                  <span className="text-2xl">{achievement.emoji}</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{achievement.title}</p>
                  <p className="text-[11px] text-muted-foreground">{achievement.description}</p>
                </div>
                {unlocked && <span className="text-xs font-semibold text-secondary">✓ Unlocked</span>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Challenges */}
      <motion.div variants={item}>
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">⚡ Weekly Challenges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHALLENGES.map((challenge) => (
            <div key={challenge.id} className="glass-card p-4 hover:border-primary/20 transition-all duration-300 group">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{challenge.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{challenge.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{challenge.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{challenge.days} days</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">{challenge.reward}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
});

export default Gamification;
