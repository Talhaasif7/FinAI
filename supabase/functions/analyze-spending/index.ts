import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { expenses, goals, subscriptions, budgets } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Analyze this user's financial data and provide insights.

EXPENSES (last 90 days): ${JSON.stringify(expenses)}
GOALS: ${JSON.stringify(goals)}
SUBSCRIPTIONS: ${JSON.stringify(subscriptions)}
BUDGETS: ${JSON.stringify(budgets)}

Provide analysis using the analyze_finances tool. Generate 4-6 specific, data-driven insights. 
Calculate a financial personality type (Saver, Spender, Investor, or Balanced).
Include goal probability percentages and monthly savings rate.
Identify specific patterns like weekend vs weekday spending, top merchants, recurring impulse buys.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a financial analyst AI. Provide data-driven insights." },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_finances",
            description: "Return structured financial analysis",
            parameters: {
              type: "object",
              properties: {
                personality: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["Saver", "Spender", "Investor", "Balanced"] },
                    emoji: { type: "string" },
                    description: { type: "string" }
                  },
                  required: ["type", "emoji", "description"]
                },
                stats: {
                  type: "object",
                  properties: {
                    goal_probability: { type: "number" },
                    savings_rate: { type: "number" },
                    avg_monthly_spend: { type: "number" },
                    months_to_goal: { type: "number" }
                  },
                  required: ["goal_probability", "savings_rate", "avg_monthly_spend", "months_to_goal"]
                },
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      action: { type: "string" },
                      type: { type: "string", enum: ["warning", "info", "success"] },
                      icon: { type: "string", enum: ["utensils", "coffee", "shopping", "trending-up", "alert", "zap"] }
                    },
                    required: ["title", "description", "action", "type", "icon"]
                  }
                },
                forecast: {
                  type: "object",
                  properties: {
                    monthly_projection: { type: "array", items: { type: "object", properties: { month: { type: "string" }, projected_savings: { type: "number" }, projected_spending: { type: "number" } }, required: ["month", "projected_savings", "projected_spending"] } }
                  },
                  required: ["monthly_projection"]
                }
              },
              required: ["personality", "stats", "insights", "forecast"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_finances" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return analysis");

    const analysis = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-spending error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
