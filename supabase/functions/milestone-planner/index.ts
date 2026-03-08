import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { milestone, financialContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a life financial planner AI. Given a life milestone and the user's financial context, create a detailed, actionable financial roadmap.

Structure your response in markdown:
1. **Overview** - 1-2 sentences about the milestone feasibility
2. **Financial Breakdown** - Itemized cost estimates
3. **Monthly Savings Plan** - How much to save each month with a timeline
4. **Action Steps** - 4-6 numbered, specific steps
5. **Risk Factors** - 2-3 potential obstacles and mitigations
6. **Pro Tips** - 2-3 insider tips to save money on this milestone

Be specific with dollar amounts and timelines. Use the user's actual financial data when available. Be encouraging but realistic.`;

    const monthsUntil = milestone.target_date
      ? Math.max(1, Math.round((new Date(milestone.target_date).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)))
      : 24;

    const userPrompt = `Life Milestone: "${milestone.title}"
Category: ${milestone.category}
Target Date: ${milestone.target_date}
Months Until: ${monthsUntil}
Estimated Cost: $${milestone.estimated_cost}
Already Saved: $${milestone.saved_amount}
Remaining: $${milestone.estimated_cost - milestone.saved_amount}
Required Monthly: $${Math.ceil((milestone.estimated_cost - milestone.saved_amount) / monthsUntil)}
${milestone.notes ? `Notes: ${milestone.notes}` : ""}

Financial Context:
- Monthly Expenses: $${financialContext.monthlyExpenses || "unknown"}
- Monthly Subscriptions: $${financialContext.monthlySubscriptions || 0}
- Active Goals: ${financialContext.goalCount || 0}
- Total Saved Across Goals: $${financialContext.totalSaved || 0}`;

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
        return new Response(JSON.stringify({ error: "Rate limited, please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const roadmap = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ roadmap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("milestone-planner error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
