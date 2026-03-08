import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth client to get user
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client for admin operations
    const admin = createClient(supabaseUrl, serviceKey);

    const { action, ...params } = await req.json();

    if (action === "join") {
      const { invite_code } = params;
      
      // Find group by invite code
      const { data: group, error: groupError } = await admin
        .from("family_groups")
        .select("id, name")
        .eq("invite_code", invite_code)
        .single();

      if (groupError || !group) {
        return new Response(JSON.stringify({ error: "Invalid invite code" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if already a member
      const { data: existing } = await admin
        .from("family_members")
        .select("id")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        return new Response(JSON.stringify({ error: "Already a member", group }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Add as member
      const { error: insertError } = await admin
        .from("family_members")
        .insert({ group_id: group.id, user_id: user.id, role: "member" });

      if (insertError) {
        return new Response(JSON.stringify({ error: "Failed to join group" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, group }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_member_spending") {
      const { group_id } = params;

      // Verify membership
      const { data: membership } = await admin
        .from("family_members")
        .select("id")
        .eq("group_id", group_id)
        .eq("user_id", user.id)
        .single();

      if (!membership) {
        return new Response(JSON.stringify({ error: "Not a member" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get all members
      const { data: members } = await admin
        .from("family_members")
        .select("user_id, role, allowance")
        .eq("group_id", group_id);

      if (!members) {
        return new Response(JSON.stringify({ spending: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userIds = members.map(m => m.user_id);

      // Get profiles for display names
      const { data: profiles } = await admin
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      // Get this month's expenses for all members
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

      const { data: expenses } = await admin
        .from("expenses")
        .select("user_id, amount, category, date, merchant")
        .in("user_id", userIds)
        .gte("date", startOfMonth);

      // Build per-member spending summary
      const memberSpending = members.map(member => {
        const profile = profiles?.find(p => p.user_id === member.user_id);
        const memberExpenses = expenses?.filter(e => e.user_id === member.user_id) || [];
        const totalSpent = memberExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        
        const categoryBreakdown: Record<string, number> = {};
        memberExpenses.forEach(e => {
          categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + Number(e.amount);
        });

        return {
          user_id: member.user_id,
          role: member.role,
          allowance: member.allowance,
          display_name: profile?.display_name || "Member",
          avatar_url: profile?.avatar_url,
          total_spent: totalSpent,
          expense_count: memberExpenses.length,
          category_breakdown: categoryBreakdown,
          is_current_user: member.user_id === user.id,
        };
      });

      const totalGroupSpending = memberSpending.reduce((sum, m) => sum + m.total_spent, 0);

      return new Response(JSON.stringify({ spending: memberSpending, total: totalGroupSpending }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
