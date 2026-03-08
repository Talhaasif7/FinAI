import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FinancialData {
  expenses: any[];
  goals: any[];
  budgets: any[];
  subscriptions: any[];
}

function calculateBaseScore(data: FinancialData): { score: number; breakdown: Record<string, number>; factors: string[] } {
  const factors: string[] = [];
  let totalScore = 0;
  let weightSum = 0;

  // 1. Savings Rate Score (25% weight)
  const savingsWeight = 25;
  const totalSaved = data.goals.reduce((sum, g) => sum + Number(g.saved || 0), 0);
  const totalTarget = data.goals.reduce((sum, g) => sum + Number(g.target || 0), 0);
  const savingsProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const savingsScore = Math.min(100, savingsProgress * 1.5);
  totalScore += savingsScore * savingsWeight;
  weightSum += savingsWeight;
  
  if (savingsProgress >= 50) factors.push("Strong savings progress toward goals");
  else if (savingsProgress < 20) factors.push("Consider increasing monthly savings contributions");

  // 2. Budget Adherence Score (25% weight)
  const budgetWeight = 25;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const thisMonthExpenses = data.expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const categorySpending: Record<string, number> = {};
  thisMonthExpenses.forEach(e => {
    categorySpending[e.category] = (categorySpending[e.category] || 0) + Number(e.amount);
  });

  let budgetScore = 100;
  let overBudgetCount = 0;
  data.budgets.forEach(b => {
    const spent = categorySpending[b.category] || 0;
    const limit = Number(b.monthly_limit);
    if (spent > limit) {
      overBudgetCount++;
      budgetScore -= Math.min(30, ((spent - limit) / limit) * 50);
    }
  });
  budgetScore = Math.max(0, budgetScore);
  totalScore += budgetScore * budgetWeight;
  weightSum += budgetWeight;

  if (overBudgetCount === 0 && data.budgets.length > 0) factors.push("Excellent budget discipline");
  else if (overBudgetCount > 0) factors.push(`Over budget in ${overBudgetCount} category(ies)`);

  // 3. Spending Consistency Score (20% weight)
  const consistencyWeight = 20;
  const weeklyTotals: number[] = [];
  const last4Weeks = [0, 1, 2, 3].map(w => {
    const start = new Date(now);
    start.setDate(start.getDate() - (w + 1) * 7);
    const end = new Date(now);
    end.setDate(end.getDate() - w * 7);
    return data.expenses
      .filter(e => {
        const d = new Date(e.date);
        return d >= start && d < end;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);
  });
  
  const avgWeekly = last4Weeks.reduce((a, b) => a + b, 0) / 4;
  const variance = last4Weeks.reduce((sum, val) => sum + Math.pow(val - avgWeekly, 2), 0) / 4;
  const stdDev = Math.sqrt(variance);
  const cv = avgWeekly > 0 ? (stdDev / avgWeekly) : 0;
  const consistencyScore = Math.max(0, 100 - cv * 100);
  totalScore += consistencyScore * consistencyWeight;
  weightSum += consistencyWeight;

  if (cv < 0.3) factors.push("Consistent spending patterns");
  else factors.push("Spending varies significantly week to week");

  // 4. Subscription Management Score (15% weight)
  const subscriptionWeight = 15;
  const monthlySubCost = data.subscriptions.reduce((sum, s) => {
    const amount = Number(s.amount);
    return sum + (s.cycle === "yearly" ? amount / 12 : amount);
  }, 0);
  
  const totalMonthlySpending = thisMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0) || 1;
  const subRatio = monthlySubCost / totalMonthlySpending;
  const subScore = Math.max(0, 100 - subRatio * 200);
  totalScore += subScore * subscriptionWeight;
  weightSum += subscriptionWeight;

  if (subRatio < 0.15) factors.push("Subscriptions are well-managed");
  else if (subRatio > 0.3) factors.push("High subscription costs relative to spending");

  // 5. Goal Diversity & Progress (15% weight)
  const goalWeight = 15;
  const activeGoals = data.goals.filter(g => Number(g.saved) < Number(g.target));
  const completedGoals = data.goals.filter(g => Number(g.saved) >= Number(g.target));
  const goalScore = Math.min(100, (completedGoals.length * 20) + (activeGoals.length * 10));
  totalScore += goalScore * goalWeight;
  weightSum += goalWeight;

  if (completedGoals.length > 0) factors.push(`${completedGoals.length} goal(s) achieved!`);
  if (activeGoals.length === 0 && completedGoals.length === 0) factors.push("Set some financial goals to improve your score");

  const finalScore = Math.round(totalScore / weightSum);

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    breakdown: {
      savings: Math.round(savingsScore),
      budgeting: Math.round(budgetScore),
      consistency: Math.round(consistencyScore),
      subscriptions: Math.round(subScore),
      goals: Math.round(goalScore),
    },
    factors,
  };
}

function getScoreLabel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 80) return { label: "Excellent", color: "#14b885", emoji: "🌟" };
  if (score >= 60) return { label: "Good", color: "#22c55e", emoji: "👍" };
  if (score >= 40) return { label: "Fair", color: "#f59e0b", emoji: "⚠️" };
  return { label: "Needs Work", color: "#ef4444", emoji: "💪" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all user financial data in parallel
    const [expensesRes, goalsRes, budgetsRes, subscriptionsRes] = await Promise.all([
      supabase.from("expenses").select("*").eq("user_id", user.id),
      supabase.from("goals").select("*").eq("user_id", user.id),
      supabase.from("budgets").select("*").eq("user_id", user.id),
      supabase.from("subscriptions").select("*").eq("user_id", user.id),
    ]);

    const financialData: FinancialData = {
      expenses: expensesRes.data || [],
      goals: goalsRes.data || [],
      budgets: budgetsRes.data || [],
      subscriptions: subscriptionsRes.data || [],
    };

    // Calculate base score
    const { score, breakdown, factors } = calculateBaseScore(financialData);
    const scoreInfo = getScoreLabel(score);

    // Generate AI-powered personalized tips
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiTips: string[] = [];

    if (LOVABLE_API_KEY) {
      try {
        const prompt = `Based on this financial health data, provide 3 concise, actionable tips (max 15 words each):
- Score: ${score}/100 (${scoreInfo.label})
- Breakdown: Savings ${breakdown.savings}%, Budget ${breakdown.budgeting}%, Consistency ${breakdown.consistency}%
- Key factors: ${factors.join(", ")}
- Monthly subscriptions: $${financialData.subscriptions.reduce((s, sub) => s + Number(sub.amount), 0).toFixed(0)}
- Active goals: ${financialData.goals.filter(g => Number(g.saved) < Number(g.target)).length}

Return ONLY a JSON array of 3 tip strings, no explanation.`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a financial advisor AI. Respond only with valid JSON." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "[]";
          try {
            const parsed = JSON.parse(content.replace(/```json?|```/g, "").trim());
            if (Array.isArray(parsed)) aiTips = parsed.slice(0, 3);
          } catch {
            console.log("Could not parse AI tips");
          }
        }
      } catch (e) {
        console.log("AI tips generation failed:", e);
      }
    }

    return new Response(
      JSON.stringify({
        score,
        label: scoreInfo.label,
        color: scoreInfo.color,
        emoji: scoreInfo.emoji,
        breakdown,
        factors,
        tips: aiTips.length > 0 ? aiTips : [
          "Track all expenses daily to maintain awareness",
          "Review subscriptions monthly for unused services",
          "Automate savings transfers on payday",
        ],
        dataPoints: {
          totalExpenses: financialData.expenses.length,
          activeGoals: financialData.goals.filter(g => Number(g.saved) < Number(g.target)).length,
          budgetsSet: financialData.budgets.length,
          subscriptions: financialData.subscriptions.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
