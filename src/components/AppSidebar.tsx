import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Target, Receipt, CreditCard, 
  Bot, TrendingUp, Settings, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoImg from "@/assets/logo.png";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
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
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="FinAI" className="h-9 w-9 rounded-lg" />
          <div>
            <h1 className="font-display text-lg font-bold gradient-text-primary">FinAI</h1>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Smart Finance</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/15"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Streak */}
      <div className="mx-3 mb-3 glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-4 w-4 text-gold" />
          <span className="text-xs font-semibold text-foreground">7 Day Streak! 🔥</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">Tracked expenses for 7 days straight.</p>
        <div className="mt-2.5 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-[70%] rounded-full bg-gold animate-pulse-glow" />
        </div>
      </div>

      {/* Settings */}
      <div className="px-3 pb-4">
        <NavLink
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
            location.pathname === "/settings" && "bg-primary/10 text-primary border border-primary/15"
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
