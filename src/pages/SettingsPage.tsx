import { motion } from "framer-motion";
import { User, Bell, Shield, Globe, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      {[
        { icon: User, label: "Profile", desc: "Manage your personal information" },
        { icon: Bell, label: "Notifications", desc: "Configure alerts and reminders" },
        { icon: Shield, label: "Security", desc: "Two-factor auth and passwords" },
        { icon: Globe, label: "Currency & Language", desc: "Set your preferred currency" },
        { icon: Palette, label: "Appearance", desc: "Theme and display preferences" },
      ].map((s) => (
        <div key={s.label} className="glass-card-hover p-5 flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
              <s.icon className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </div>
          <span className="text-muted-foreground">→</span>
        </div>
      ))}
    </motion.div>
  );
}
