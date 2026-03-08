import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { scenario, snapshot, result } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a financial simulation analyst for a Digital Twin engine. Given a user's financial scenario and simulation results, provide a brief, insightful narrative analysis.

Be specific with numbers. Use markdown formatting. Structure your response as:
1. **Verdict** (1 sentence: good/bad/neutral impact)
2. **Key Findings** (2-3 bullet points with specific numbers)
3. **Recommendation** (1 actionable suggestion)

Keep it under 150 words. Be direct and practical.`;

    const userPrompt = `Scenario: "${scenario.label}"
Monthly Income: $${snapshot.monthlyIncome}
Monthly Expenses: $${Math.round(snapshot.monthlyExpenses)}
Monthly Subscriptions: $${Math.round(snapshot.monthlySubscriptions)}
Current Savings: $${snapshot.totalSaved}
Goals: ${snapshot.goals.map((g: any) => `${g.name} ($${g.saved}/$${g.target})`).join(", ") || "None"}

Simulation over ${scenario.years} years:
- Savings difference: ${result.summaryStats.savingsDiffAtEnd >= 0 ? "+" : ""}$${result.summaryStats.savingsDiffAtEnd.toLocaleString()}
- Risk change: ${result.summaryStats.riskDiffAvg > 0 ? "+" : ""}${result.summaryStats.riskDiffAvg} points
- Goals affected: ${result.summaryStats.goalsAffected}
- Final savings (baseline): $${result.baseline[result.baseline.length - 1].savings.toLocaleString()}
- Final savings (scenario): $${result.scenario[result.scenario.length - 1].savings.toLocaleString()}
${result.goalImpacts.map((g: any) => `- ${g.name}: ${g.delayMonths !== null ? (g.delayMonths > 0 ? `+${g.delayMonths}mo delay` : g.delayMonths < 0 ? `${Math.abs(g.delayMonths)}mo faster` : "no change") : "unaffected"}`).join("\n")}`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const narrative = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ narrative }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("digital-twin error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
