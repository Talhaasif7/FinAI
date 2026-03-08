import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Target, Receipt, CreditCard, 
  Bot, TrendingUp, Settings, Sparkles, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { to: "/insights", icon: TrendingUp, label: "Insights" },
  { to: "/assistant", icon: Bot, label: "AI Assistant" },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">FinAI</h1>
          <p className="text-xs text-muted-foreground">Smart Finance</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Streak */}
      <div className="mx-3 mb-4 glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold text-foreground">7 Day Streak!</span>
        </div>
        <p className="text-xs text-muted-foreground">You've tracked expenses for 7 days straight. Keep it up!</p>
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-[70%] rounded-full bg-accent animate-pulse-glow" />
        </div>
      </div>

      {/* Settings */}
      <div className="px-3 pb-4">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <Settings className="h-4.5 w-4.5" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
