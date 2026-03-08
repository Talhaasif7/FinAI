import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users, Plus, Copy, UserPlus, Crown, User,
  Wallet, TrendingUp, Settings, Trash2, Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UpgradePrompt } from "@/components/UpgradePrompt";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface FamilyGroup {
  id: string;
  name: string;
  created_by: string;
  invite_code: string;
  monthly_budget: number;
  created_at: string;
}

interface MemberSpending {
  user_id: string;
  role: string;
  allowance: number | null;
  display_name: string;
  avatar_url: string | null;
  total_spent: number;
  expense_count: number;
  category_breakdown: Record<string, number>;
  is_current_user: boolean;
}

export default function FamilyBudget() {
  const { subscription } = useAuth();

  if (!subscription.loading && subscription.tier !== "team") {
    return (
      <UpgradePrompt
        feature="Family Budget & Shared Goals"
        description="Collaborate on household finances with shared budgets, member spending tracking, allowances, and multi-user access. Available exclusively on the Team plan."
        requiredTier="team"
      />
    );
  }
  return <FamilyBudgetContent />;
}

function FamilyBudgetContent() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<FamilyGroup | null>(null);
  const [memberSpending, setMemberSpending] = useState<MemberSpending[]>([]);
  const [totalGroupSpending, setTotalGroupSpending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [spendingLoading, setSpendingLoading] = useState(false);

  // Create group state
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [creating, setCreating] = useState(false);

  // Join group state
  const [joinOpen, setJoinOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);

  const [copiedCode, setCopiedCode] = useState(false);

  const fetchGroups = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("family_groups")
      .select("*")
      .order("created_at", { ascending: false });
    setGroups((data as FamilyGroup[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const fetchMemberSpending = useCallback(async (groupId: string) => {
    if (!user) return;
    setSpendingLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/family-budget`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: "get_member_spending", group_id: groupId }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        setMemberSpending(result.spending || []);
        setTotalGroupSpending(result.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSpendingLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroup) fetchMemberSpending(selectedGroup.id);
  }, [selectedGroup, fetchMemberSpending]);

  // Auto-select first group
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) setSelectedGroup(groups[0]);
  }, [groups, selectedGroup]);

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) return;
    setCreating(true);
    try {
      const { data: group, error } = await supabase
        .from("family_groups")
        .insert({
          name: newGroupName.trim(),
          created_by: user.id,
          monthly_budget: parseFloat(newBudget) || 0,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin
      await supabase.from("family_members").insert({
        group_id: (group as any).id,
        user_id: user.id,
        role: "admin",
      } as any);

      toast({ title: "Family group created!", description: "Share the invite code with your family." });
      setCreateOpen(false);
      setNewGroupName("");
      setNewBudget("");
      fetchGroups();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user || !inviteCode.trim()) return;
    setJoining(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/family-budget`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: "join", invite_code: inviteCode.trim() }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast({ title: "Joined group!", description: `Welcome to ${result.group.name}` });
      setJoinOpen(false);
      setInviteCode("");
      fetchGroups();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setJoining(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast({ title: "Copied!", description: "Invite code copied to clipboard" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Loading family budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Family Budget
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Collaborate on household finances with shared budgets
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" /> Join Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Family Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Invite Code</Label>
                  <Input
                    placeholder="Enter invite code..."
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>
                <Button onClick={handleJoinGroup} disabled={joining || !inviteCode.trim()} className="w-full">
                  {joining ? "Joining..." : "Join Group"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Family Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Group Name</Label>
                  <Input
                    placeholder="e.g., Smith Family"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Monthly Budget</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateGroup} disabled={creating || !newGroupName.trim()} className="w-full">
                  {creating ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {groups.length === 0 ? (
        /* Empty State */
        <motion.div variants={item}>
          <Card className="glass-card p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Family Groups Yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Create a family group to start tracking shared household expenses, set budgets,
              and manage allowances for each member.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Create Group
              </Button>
              <Button variant="outline" onClick={() => setJoinOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" /> Join Group
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Group Tabs */}
          <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedGroup?.id === group.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {group.name}
              </button>
            ))}
          </motion.div>

          {selectedGroup && (
            <>
              {/* Group Overview */}
              <motion.div variants={item}>
                <Card className="glass-card overflow-hidden">
                  <div className="relative p-6">
                    <div className="absolute inset-0 opacity-5" style={{ background: "var(--gradient-hero)" }} />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          {memberSpending.length} member{memberSpending.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">Invite Code</div>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-muted px-3 py-1 rounded-lg text-sm font-mono font-bold tracking-wider">
                              {selectedGroup.invite_code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => copyInviteCode(selectedGroup.invite_code)}
                            >
                              {copiedCode ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Budget Progress */}
                    {selectedGroup.monthly_budget > 0 && (
                      <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Monthly Budget</span>
                          <span className="font-semibold">
                            ${totalGroupSpending.toFixed(0)} / ${selectedGroup.monthly_budget.toFixed(0)}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(100, (totalGroupSpending / selectedGroup.monthly_budget) * 100)}
                          className="h-3"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            {((totalGroupSpending / selectedGroup.monthly_budget) * 100).toFixed(0)}% used
                          </span>
                          <span>
                            ${Math.max(0, selectedGroup.monthly_budget - totalGroupSpending).toFixed(0)} remaining
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Member Spending Cards */}
              <motion.div variants={item}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Member Spending — This Month
                </h3>
                {spendingLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="glass-card p-5 animate-pulse">
                        <div className="h-12 bg-muted rounded-lg mb-3" />
                        <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {memberSpending.map((member) => (
                      <Card
                        key={member.user_id}
                        className={`glass-card group hover:shadow-lg transition-all duration-300 ${
                          member.is_current_user ? "border-primary/30" : ""
                        }`}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              {member.role === "admin" ? (
                                <Crown className="h-5 w-5 text-accent" />
                              ) : (
                                <User className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-sm flex items-center gap-2">
                                {member.display_name}
                                {member.is_current_user && (
                                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">You</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground capitalize">{member.role}</div>
                            </div>
                          </div>

                          <div className="text-2xl font-bold mb-1">
                            ${member.total_spent.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground mb-3">
                            {member.expense_count} expense{member.expense_count !== 1 ? "s" : ""} this month
                          </div>

                          {member.allowance !== null && member.allowance > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Allowance</span>
                                <span>${member.total_spent.toFixed(0)} / ${member.allowance.toFixed(0)}</span>
                              </div>
                              <Progress
                                value={Math.min(100, (member.total_spent / member.allowance) * 100)}
                                className="h-1.5"
                              />
                            </div>
                          )}

                          {/* Category breakdown */}
                          <div className="space-y-1.5">
                            {Object.entries(member.category_breakdown)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 3)
                              .map(([category, amount]) => (
                                <div key={category} className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{category}</span>
                                  <span className="font-medium">${amount.toFixed(0)}</span>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Combined Category View */}
              {memberSpending.length > 0 && (
                <motion.div variants={item}>
                  <Card className="glass-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Combined Spending by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(() => {
                          const combined: Record<string, number> = {};
                          memberSpending.forEach((m) => {
                            Object.entries(m.category_breakdown).forEach(([cat, amt]) => {
                              combined[cat] = (combined[cat] || 0) + amt;
                            });
                          });
                          return Object.entries(combined)
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, amount]) => {
                              const pct = totalGroupSpending > 0 ? (amount / totalGroupSpending) * 100 : 0;
                              return (
                                <div key={category}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">{category}</span>
                                    <span className="text-muted-foreground">
                                      ${amount.toFixed(0)} ({pct.toFixed(0)}%)
                                    </span>
                                  </div>
                                  <Progress value={pct} className="h-2" />
                                </div>
                              );
                            });
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
