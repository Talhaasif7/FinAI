import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, TrendingUp, AlertTriangle, Target, Play, Loader2,
  ChevronDown, Zap, DollarSign, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, BarChart, Bar, Legend
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  runSimulation,
  PRESET_SCENARIOS,
  type FinancialSnapshot,
  type Scenario,
  type SimulationResult,
} from "@/lib/simulation-engine";

interface DigitalTwinProps {
  context: {
    expenses: { category: string; amount: number; merchant: string; date: string }[];
    goals: { name: string; target: number; saved: number; deadline: string }[];
    subscriptions: { name: string; amount: number; cycle: string }[];
    budgets: { category: string; monthly_limit: number }[];
  } | null;
}

const TWIN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/digital-twin`;

export default function DigitalTwin({ context }: DigitalTwinProps) {
  const { user } = useAuth();
  const [customScenario, setCustomScenario] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [years, setYears] = useState(5);
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [aiNarrative, setAiNarrative] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Custom scenario params
  const [incomeChange, setIncomeChange] = useState(0);
  const [oneTimeExpense, setOneTimeExpense] = useState(0);
  const [monthlyExpenseChange, setMonthlyExpenseChange] = useState(0);
  const [extraSaving, setExtraSaving] = useState(0);

  const snapshot: FinancialSnapshot = useMemo(() => {
    if (!context) return { monthlyIncome, monthlyExpenses: 0, monthlySubscriptions: 0, totalSaved: 0, goals: [] };
    
    const totalExpenses = context.expenses.reduce((s, e) => s + e.amount, 0);
    const months = Math.max(1, new Set(context.expenses.map(e => e.date.slice(0, 7))).size);
    const monthlySubs = context.subscriptions.reduce((s, sub) =>
      s + (sub.cycle === "yearly" ? sub.amount / 12 : sub.amount), 0);

    return {
      monthlyIncome,
      monthlyExpenses: totalExpenses / months,
      monthlySubscriptions: monthlySubs,
      totalSaved: context.goals.reduce((s, g) => s + g.saved, 0),
      goals: context.goals,
    };
  }, [context, monthlyIncome]);

  const runSim = useCallback(async (scenario: Scenario) => {
    setIsSimulating(true);
    setAiNarrative("");
    
    // Run deterministic simulation
    const simResult = runSimulation(snapshot, scenario);
    setResult(simResult);
    setIsSimulating(false);

    // Fetch AI narrative
    setIsLoadingAI(true);
    try {
      const resp = await fetch(TWIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ scenario, snapshot, result: simResult }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setAiNarrative(data.narrative || "");
      }
    } catch (e) {
      console.error("AI narrative error:", e);
    } finally {
      setIsLoadingAI(false);
    }
  }, [snapshot]);

  const handlePreset = (idx: number) => {
    setSelectedPreset(idx);
    const preset = PRESET_SCENARIOS[idx];
    runSim({ ...preset, years });
  };

  const handleCustomRun = () => {
    if (customScenario.trim()) {
      // Parse custom scenario into params
      runSim({
        label: customScenario,
        incomeChangePercent: incomeChange,
        oneTimeExpense,
        monthlyExpenseChange,
        extraMonthlySaving: extraSaving,
        years,
      });
    } else {
      runSim({
        label: "Custom scenario",
        incomeChangePercent: incomeChange,
        oneTimeExpense,
        monthlyExpenseChange,
        extraMonthlySaving: extraSaving,
        years,
      });
    }
  };

  const savingsChartConfig = {
    baseline: { label: "Current Path", color: "hsl(var(--muted-foreground))" },
    scenario: { label: "With Change", color: "hsl(var(--primary))" },
  };

  const riskChartConfig = {
    baseline: { label: "Current Risk", color: "hsl(var(--muted-foreground))" },
    scenario: { label: "Scenario Risk", color: "hsl(var(--destructive))" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Financial Digital Twin</h2>
          <p className="text-xs text-muted-foreground">Simulate the future impact of your financial decisions</p>
        </div>
      </div>

      {/* Income Input */}
      <Card className="glass-card border-border/50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Monthly Income
            </div>
            <Input
              type="number"
              value={monthlyIncome}
              onChange={e => setMonthlyIncome(Number(e.target.value) || 0)}
              className="w-32"
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
              Simulate
              <Select value={String(years)} onValueChange={v => setYears(Number(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 10, 15, 20].map(y => (
                    <SelectItem key={y} value={String(y)}>{y}y</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preset Scenarios */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Quick Scenarios</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePreset(idx)}
              className={`text-left text-sm px-4 py-3 rounded-xl border transition-all duration-200 ${
                selectedPreset === idx
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              <Zap className="h-3.5 w-3.5 inline mr-2 text-primary" />
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Scenario */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Custom Scenario
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-muted-foreground hover:text-foreground">
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={customScenario}
            onChange={e => setCustomScenario(e.target.value)}
            placeholder='e.g. "What if I move to Singapore?"'
          />
          
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Income Change %</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[incomeChange]}
                        onValueChange={v => setIncomeChange(v[0])}
                        min={-100}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-12 text-right">{incomeChange > 0 ? "+" : ""}{incomeChange}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">One-time Expense</label>
                    <Input type="number" value={oneTimeExpense} onChange={e => setOneTimeExpense(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Monthly Expense Change</label>
                    <Input type="number" value={monthlyExpenseChange} onChange={e => setMonthlyExpenseChange(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Extra Monthly Saving</label>
                    <Input type="number" value={extraSaving} onChange={e => setExtraSaving(Number(e.target.value))} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button onClick={handleCustomRun} className="w-full" disabled={isSimulating}>
            {isSimulating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Run Simulation
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="glass-card border-border/50">
                <CardContent className="pt-4 pb-4 text-center">
                  <div className={`text-xl font-bold font-mono ${result.summaryStats.savingsDiffAtEnd >= 0 ? "text-primary" : "text-destructive"}`}>
                    {result.summaryStats.savingsDiffAtEnd >= 0 ? "+" : ""}${Math.abs(result.summaryStats.savingsDiffAtEnd).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Savings Impact</p>
                  {result.summaryStats.savingsDiffAtEnd >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-primary mx-auto mt-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-destructive mx-auto mt-1" />
                  )}
                </CardContent>
              </Card>
              <Card className="glass-card border-border/50">
                <CardContent className="pt-4 pb-4 text-center">
                  <div className={`text-xl font-bold font-mono ${result.summaryStats.riskDiffAvg <= 0 ? "text-primary" : "text-destructive"}`}>
                    {result.summaryStats.riskDiffAvg > 0 ? "+" : ""}{result.summaryStats.riskDiffAvg}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Risk Change</p>
                  <AlertTriangle className="h-3 w-3 text-muted-foreground mx-auto mt-1" />
                </CardContent>
              </Card>
              <Card className="glass-card border-border/50">
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-xl font-bold font-mono text-foreground">
                    {result.summaryStats.goalsAffected}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Goals Affected</p>
                  <Target className="h-3 w-3 text-muted-foreground mx-auto mt-1" />
                </CardContent>
              </Card>
            </div>

            {/* Savings Curve Chart */}
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Savings Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={savingsChartConfig} className="h-[250px] w-full">
                  <AreaChart data={result.baseline.map((b, i) => ({
                    year: `Y${b.year}`,
                    baseline: b.savings,
                    scenario: result.scenario[i].savings,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="baseline" stroke="var(--color-baseline)" fill="var(--color-baseline)" fillOpacity={0.1} strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="scenario" stroke="var(--color-scenario)" fill="var(--color-scenario)" fillOpacity={0.2} />
                    <Legend />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Risk Chart */}
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Risk Level Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={riskChartConfig} className="h-[200px] w-full">
                  <LineChart data={result.baseline.map((b, i) => ({
                    year: `Y${b.year}`,
                    baseline: b.riskScore,
                    scenario: result.scenario[i].riskScore,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="baseline" stroke="var(--color-baseline)" strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="scenario" stroke="var(--color-scenario)" dot={false} strokeWidth={2} />
                    <Legend />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Goal Impact */}
            {result.goalImpacts.length > 0 && (
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Goal Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.goalImpacts.map((gi, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{gi.name}</span>
                        <div className="flex items-center gap-2">
                          {gi.delayMonths === null ? (
                            <Badge variant="secondary" className="text-xs">No change</Badge>
                          ) : gi.delayMonths === 0 ? (
                            <Badge variant="secondary" className="text-xs"><Minus className="h-3 w-3 mr-1" />Same pace</Badge>
                          ) : gi.delayMonths > 0 ? (
                            <Badge variant="destructive" className="text-xs">
                              <ArrowDownRight className="h-3 w-3 mr-1" />+{gi.delayMonths}mo delay
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                              <ArrowUpRight className="h-3 w-3 mr-1" />{Math.abs(gi.delayMonths)}mo faster
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Narrative */}
            <Card className="glass-card border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAI ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating personalized insights...
                  </div>
                ) : aiNarrative ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown>{aiNarrative}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">AI insights will appear after simulation.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
