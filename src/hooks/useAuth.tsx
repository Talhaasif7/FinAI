import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export const STRIPE_TIERS = {
  pro: {
    price_id: "price_1T8eCr2N83SQqQkDobIkteJH",
    product_id: "prod_U6rwWYIrMQHGlM",
    name: "Pro",
    price: 7,
  },
  team: {
    price_id: "price_1T8eEZ2N83SQqQkDxMu5ul9U",
    product_id: "prod_U6rykEzUU0GCla",
    name: "Team",
    price: 11,
  },
} as const;

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  tier: "free" | "pro" | "team";
  subscriptionEnd: string | null;
  loading: boolean;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionState;
  checkSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultSub: SubscriptionState = { subscribed: false, productId: null, tier: "free", subscriptionEnd: null, loading: true };

const AuthContext = createContext<AuthCtx>({
  user: null, session: null, loading: true,
  subscription: defaultSub,
  checkSubscription: async () => {},
  signOut: async () => {},
});

function getTier(productId: string | null): "free" | "pro" | "team" {
  if (productId === STRIPE_TIERS.pro.product_id) return "pro";
  if (productId === STRIPE_TIERS.team.product_id) return "team";
  return "free";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSub);

  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      const productId = data?.product_id ?? null;
      setSubscription({
        subscribed: data?.subscribed ?? false,
        productId,
        tier: getTier(productId),
        subscriptionEnd: data?.subscription_end ?? null,
        loading: false,
      });
    } catch {
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        setTimeout(() => checkSubscription(), 0);
      } else {
        setSubscription({ ...defaultSub, loading: false });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) checkSubscription();
      else setSubscription({ ...defaultSub, loading: false });
    });

    return () => authSub.unsubscribe();
  }, [checkSubscription]);

  // Periodically refresh subscription status
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, subscription, checkSubscription, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
