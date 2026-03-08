import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Lock, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, STRIPE_TIERS } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UpgradePromptProps {
  feature: string;
  description: string;
  requiredTier: "pro" | "team";
}

export const UpgradePrompt = forwardRef<HTMLDivElement, UpgradePromptProps>(function UpgradePrompt({ feature, description, requiredTier }, ref) {
  const { toast } = useToast();
  const tier = STRIPE_TIERS[requiredTier];

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: tier.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="glass-card p-10 max-w-md w-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">{feature}</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{description}</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Crown className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              Available on {tier.name} plan — ${tier.price}/month
            </span>
          </div>
          <Button onClick={handleUpgrade} size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-teal-light w-full">
            <Sparkles className="h-4 w-4" /> Upgrade to {tier.name}
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

// Small inline badge for features that are partially locked
export function UpgradeBadge({ requiredTier, onClick }: { requiredTier: "pro" | "team"; onClick?: () => void }) {
  const tier = STRIPE_TIERS[requiredTier];
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[10px] font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full hover:bg-accent/20 transition-colors"
    >
      <Crown className="h-3 w-3" />
      {tier.name}
    </button>
  );
}
