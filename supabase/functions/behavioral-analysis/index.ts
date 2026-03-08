import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SpendingPattern {
  timeOfDay: Record<string, { count: number; total: number }>;
  dayOfWeek: Record<string, { count: number; total: number }>;
  impulseBuys: number;
  averageTransaction: number;
  largestCategory: string;
  weekendVsWeekday: { weekend: number; weekday: number };
  recentTrend: "increasing" | "decreasing" | "stable";
  spendingPersonality: string;
}

function analyzePatterns(expenses: any[]): SpendingPattern {
  const timeOfDay: Record<string, { count: number; total: number }> = {
    morning: { count: 0, total: 0 },     // 6-12
    afternoon: { count: 0, total: 0 },   // 12-17
    evening: { count: 0, total: 0 },     // 17-21
    night: { count: 0, total: 0 },       // 21-6
  };

  const dayOfWeek: Record<string, { count: number; total: number }> = {
    Monday: { count: 0, total: 0 },
    Tuesday: { count: 0, total: 0 },
    Wednesday: { count: 0, total: 0 },
    Thursday: { count: 0, total: 0 },
    Friday: { count: 0, total: 0 },
    Saturday: { count: 0, total: 0 },
    Sunday: { count: 0, total: 0 },
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const categoryTotals: Record<string, number> = {};
  let weekendTotal = 0, weekdayTotal = 0;
  let impulseBuys = 0;

  expenses.forEach((e) => {
    const amount = Number(e.amount);
    const date = new Date(e.date);
    const hour = new Date(e.created_at).getHours();
    const dayName = dayNames[date.getDay()];

    // Time of day
    if (hour >= 6 && hour < 12) {
      timeOfDay.morning.count++;
      timeOfDay.morning.total += amount;
    } else if (hour >= 12 && hour < 17) {
      timeOfDay.afternoon.count++;
      timeOfDay.afternoon.total += amount;
    } else if (hour >= 17 && hour < 21) {
      timeOfDay.evening.count++;
      timeOfDay.evening.total += amount;
    } else {
      timeOfDay.night.count++;
      timeOfDay.night.total += amount;
    }

    // Day of week
    dayOfWeek[dayName].count++;
    dayOfWeek[dayName].total += amount;

    // Weekend vs weekday
    if (date.getDay() === 0 || date.getDay() === 6) {
      weekendTotal += amount;
    } else {
      weekdayTotal += amount;
    }

    // Category totals
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amount;

    // Impulse buys: night purchases on Entertainment/Shopping
    if ((hour >= 21 || hour < 6) && (e.category === "Shopping" || e.category === "Entertainment")) {
      impulseBuys++;
    }
  });

  const totalAmount = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const averageTransaction = expenses.length > 0 ? totalAmount / expenses.length : 0;
  
  const largestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

  // Recent trend (last 2 weeks vs previous 2 weeks)
  const now = new Date();
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const recentTotal = expenses
    .filter(e => new Date(e.date) >= twoWeeksAgo)
    .reduce((s, e) => s + Number(e.amount), 0);
  const previousTotal = expenses
    .filter(e => new Date(e.date) >= fourWeeksAgo && new Date(e.date) < twoWeeksAgo)
    .reduce((s, e) => s + Number(e.amount), 0);

  let recentTrend: "increasing" | "decreasing" | "stable" = "stable";
  if (previousTotal > 0) {
    const change = (recentTotal - previousTotal) / previousTotal;
    if (change > 0.15) recentTrend = "increasing";
    else if (change < -0.15) recentTrend = "decreasing";
  }

  // Spending personality
  let spendingPersonality = "Balanced Spender";
  const peakTime = Object.entries(timeOfDay).sort((a, b) => b[1].total - a[1].total)[0][0];
  const weekendRatio = (weekendTotal + weekdayTotal > 0) ? weekendTotal / (weekendTotal + weekdayTotal) : 0;
  
  if (impulseBuys > expenses.length * 0.2) {
    spendingPersonality = "Impulse Shopper";
  } else if (peakTime === "night") {
    spendingPersonality = "Night Owl Spender";
  } else if (weekendRatio > 0.5) {
    spendingPersonality = "Weekend Warrior";
  } else if (largestCategory === "Food") {
    spendingPersonality = "Foodie";
  } else if (recentTrend === "decreasing") {
    spendingPersonality = "Savvy Saver";
  }

  return {
    timeOfDay,
    dayOfWeek,
    impulseBuys,
    averageTransaction,
    largestCategory,
    weekendVsWeekday: { weekend: weekendTotal, weekday: weekdayTotal },
    recentTrend,
    spendingPersonality,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch last 90 days of expenses
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { data: expenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", ninetyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (!expenses || expenses.length === 0) {
      return new Response(JSON.stringify({
        patterns: null,
        nudges: ["Start tracking expenses to discover your spending patterns!"],
        insights: [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const patterns = analyzePatterns(expenses);

    // Generate AI nudges
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiNudges: string[] = [];
    let aiInsights: string[] = [];

    if (LOVABLE_API_KEY) {
      try {
        const prompt = `Analyze this spending behavior and provide 3 brief, encouraging nudges (max 20 words each) to improve habits:
- Personality: ${patterns.spendingPersonality}
- Impulse buys (night shopping): ${patterns.impulseBuys} out of ${expenses.length} transactions
- Peak spending time: ${Object.entries(patterns.timeOfDay).sort((a, b) => b[1].total - a[1].total)[0][0]}
- Weekend spending: $${patterns.weekendVsWeekday.weekend.toFixed(0)} vs Weekday: $${patterns.weekendVsWeekday.weekday.toFixed(0)}
- Trend: ${patterns.recentTrend}
- Top category: ${patterns.largestCategory}
- Avg transaction: $${patterns.averageTransaction.toFixed(0)}

Also provide 2 deeper insights (max 30 words each) about behavioral patterns.

Return JSON: { "nudges": ["...", "...", "..."], "insights": ["...", "..."] }`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a behavioral finance expert. Be encouraging and non-judgmental. Return only valid JSON." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "{}";
          try {
            const parsed = JSON.parse(content.replace(/```json?|```/g, "").trim());
            if (Array.isArray(parsed.nudges)) aiNudges = parsed.nudges.slice(0, 3);
            if (Array.isArray(parsed.insights)) aiInsights = parsed.insights.slice(0, 2);
          } catch {
            console.log("Could not parse AI response");
          }
        }
      } catch (e) {
        console.log("AI generation failed:", e);
      }
    }

    // Fallback nudges if AI fails
    if (aiNudges.length === 0) {
      if (patterns.impulseBuys > 0) {
        aiNudges.push("Try waiting 24 hours before late-night purchases to avoid impulse buys.");
      }
      if (patterns.recentTrend === "increasing") {
        aiNudges.push("Your spending has increased recently. Consider reviewing your recent transactions.");
      }
      if (patterns.weekendVsWeekday.weekend > patterns.weekendVsWeekday.weekday) {
        aiNudges.push("Weekend spending is higher than weekdays. Plan weekend activities in advance.");
      }
      if (aiNudges.length === 0) {
        aiNudges.push("Great job tracking your expenses! Keep up the consistent monitoring.");
      }
    }

    return new Response(JSON.stringify({
      patterns,
      nudges: aiNudges,
      insights: aiInsights,
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((s, e) => s + Number(e.amount), 0),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
