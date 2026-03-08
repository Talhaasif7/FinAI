import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { expenses, goals, subscriptions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Generate a weekly financial summary for this user. Be warm, encouraging, and specific.

EXPENSES THIS WEEK: ${JSON.stringify(expenses)}
GOALS: ${JSON.stringify(goals)}
SUBSCRIPTIONS: ${JSON.stringify(subscriptions)}

Use the weekly_report tool to return a structured weekly report.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a friendly financial coach writing a weekly money story." },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "weekly_report",
            description: "Generate weekly financial report",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Catchy report title like 'Your Money Story This Week'" },
                summary: { type: "string", description: "2-3 sentence overview of the week" },
                total_spent: { type: "number" },
                top_category: { type: "string" },
                top_category_amount: { type: "number" },
                highlights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      emoji: { type: "string" },
                      text: { type: "string" }
                    },
                    required: ["emoji", "text"]
                  }
                },
                tip: { type: "string", description: "One actionable savings tip for next week" },
                mood: { type: "string", enum: ["great", "good", "okay", "needs_work"], description: "Overall financial health this week" }
              },
              required: ["title", "summary", "total_spent", "top_category", "top_category_amount", "highlights", "tip", "mood"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "weekly_report" } }
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
      throw new Error("AI report generation failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return report");

    const report = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weekly-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
