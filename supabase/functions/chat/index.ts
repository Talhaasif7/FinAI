import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FinancialContext {
  expenses: { category: string; amount: number; merchant: string; date: string }[];
  goals: { name: string; target: number; saved: number; deadline: string }[];
  subscriptions: { name: string; amount: number; cycle: string }[];
  budgets: { category: string; monthly_limit: number }[];
}

function buildContextPrompt(ctx: FinancialContext): string {
  const now = new Date();
  const thisMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Calculate key metrics
  const totalSpent = ctx.expenses.reduce((s, e) => s + e.amount, 0);
  const totalSaved = ctx.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = ctx.goals.reduce((s, g) => s + g.target, 0);
  const monthlySubscriptions = ctx.subscriptions.reduce((s, sub) => 
    s + (sub.cycle === 'yearly' ? sub.amount / 12 : sub.amount), 0
  );

  // Category breakdown
  const categorySpend: Record<string, number> = {};
  ctx.expenses.forEach(e => {
    categorySpend[e.category] = (categorySpend[e.category] || 0) + e.amount;
  });
  const topCategories = Object.entries(categorySpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: $${amt.toFixed(0)}`)
    .join(", ");

  // Recent merchants
  const recentMerchants = [...new Set(ctx.expenses.slice(0, 10).map(e => e.merchant))].slice(0, 5).join(", ");

  // Goal progress
  const goalSummary = ctx.goals.map(g => {
    const pct = g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0;
    return `${g.name}: $${g.saved}/$${g.target} (${pct}%) by ${g.deadline}`;
  }).join("; ");

  // Budget status
  const budgetStatus = ctx.budgets.map(b => {
    const spent = categorySpend[b.category] || 0;
    const pct = Math.round((spent / b.monthly_limit) * 100);
    return `${b.category}: $${spent.toFixed(0)}/$${b.monthly_limit} (${pct}%)`;
  }).join("; ");

  return `
[FINANCIAL CONTEXT - ${thisMonth}]
📊 Total Spending: $${totalSpent.toFixed(0)} across ${ctx.expenses.length} transactions
💰 Total Saved: $${totalSaved.toFixed(0)} toward $${totalTarget.toFixed(0)} in goals
📦 Monthly Subscriptions: $${monthlySubscriptions.toFixed(0)}/month

🏷️ Top Categories: ${topCategories || "No expenses yet"}
🏪 Recent Merchants: ${recentMerchants || "None"}

🎯 Goals: ${goalSummary || "No goals set"}
📋 Budget Status: ${budgetStatus || "No budgets set"}

${ctx.subscriptions.length > 0 ? `📅 Active Subscriptions: ${ctx.subscriptions.map(s => `${s.name} $${s.amount}/${s.cycle}`).join(", ")}` : ""}

Use this data to provide specific, personalized financial advice. Reference actual numbers and merchants when relevant.
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build system prompt with optional context
    let systemPrompt = `You are FinAI, a smart and friendly AI financial coach. You help users understand their spending, savings goals, and subscriptions. You provide actionable, personalized financial advice. Keep responses concise, use markdown formatting with bold text, bullet points, and emojis where appropriate. Be encouraging and specific.`;

    if (context) {
      const contextPrompt = buildContextPrompt(context);
      systemPrompt += `\n\n${contextPrompt}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
