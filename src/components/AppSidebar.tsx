import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Target, Receipt, CreditCard, 
  Bot, TrendingUp, Settings, Flame, LogOut, Wallet, Trophy, Activity, Users, Brain, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import logoImg from "@/assets/logo.png";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tier: null },
  { to: "/health", icon: Activity, label: "Health Score", tier: null },
  { to: "/goals", icon: Target, label: "Goals", tier: null },
  { to: "/expenses", icon: Receipt, label: "Expenses", tier: null },
  { to: "/cards", icon: CreditCard, label: "My Cards", tier: null },
  { to: "/subscriptions", icon: Wallet, label: "Subscriptions", tier: null },
  { to: "/budgets", icon: Wallet, label: "Budgets", tier: null },
  { to: "/insights", icon: TrendingUp, label: "Insights", tier: "pro" as const },
  { to: "/assistant", icon: Bot, label: "AI Assistant", tier: "pro" as const },
  { to: "/gamification", icon: Trophy, label: "Achievements", tier: null },
  { to: "/family", icon: Users, label: "Family Budget", tier: "team" as const },
  { to: "/behavior", icon: Brain, label: "Behavior Analysis", tier: "pro" as const },
];

interface Props {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: Props) {
  const location = useLocation();
  const { user, signOut, subscription } = useAuth();
  const tierOrder = { free: 0, pro: 1, team: 2 } as const;

  return (
    <aside className="h-screen w-64 border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-border">
        <div className="flex items-center">
          <img src={logoImg} alt="FinAI" className="h-14 w-14 rounded-xl dark:brightness-0 dark:invert" />
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((navItem) => {
          const isActive = location.pathname === navItem.to;
          const isLocked = navItem.tier && tierOrder[subscription.tier] < tierOrder[navItem.tier];
          return (
            <NavLink
              key={navItem.to}
              to={navItem.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-muted/40",
                isLocked && "opacity-60"
              )}
            >
              <navItem.icon className={cn(
                "h-[17px] w-[17px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {navItem.label}
              {isLocked && (
                <Crown className="ml-auto h-3 w-3 text-accent" />
              )}
              {isActive && !isLocked && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Streak card */}
      <div className="mx-3 mb-3 neon-card p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Flame className="h-3.5 w-3.5 text-amber" />
          <span className="text-[11px] font-semibold text-foreground">Daily streak 🔥</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">Track an expense to keep your streak alive.</p>
        <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-[60%] rounded-full" style={{ background: "var(--gradient-gold)" }} />
        </div>
      </div>

      {/* Bottom */}
      <div className="px-3 pb-3 space-y-0.5 border-t border-border pt-2">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-sidebar-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
            location.pathname === "/settings" && "bg-primary/10 text-primary"
          )}
        >
          <Settings className="h-[17px] w-[17px]" />
          Settings
        </NavLink>
        {user && (
          <button
            onClick={signOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="h-[17px] w-[17px]" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
