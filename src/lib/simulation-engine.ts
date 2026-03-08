/**
 * Deterministic financial simulation engine.
 * Projects savings, goal progress, and risk over 1–20 years.
 */

export interface FinancialSnapshot {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySubscriptions: number;
  totalSaved: number;
  goals: { name: string; target: number; saved: number; deadline: string }[];
}

export interface Scenario {
  label: string;
  incomeChangePercent?: number;   // e.g. +15 means 15% raise
  oneTimeExpense?: number;        // e.g. 1200 for a phone
  monthlyExpenseChange?: number;  // e.g. +500 for relocation
  extraMonthlySaving?: number;    // e.g. +200
  years: number;
}

export interface YearProjection {
  year: number;
  savings: number;
  monthlyNet: number;
  goalsCompleted: number;
  totalGoals: number;
  riskScore: number; // 0-100, higher = riskier
}

export interface SimulationResult {
  baseline: YearProjection[];
  scenario: YearProjection[];
  goalImpacts: {
    name: string;
    baselineCompletionMonth: number | null;
    scenarioCompletionMonth: number | null;
    delayMonths: number | null; // positive = delayed, negative = accelerated
  }[];
  summaryStats: {
    savingsDiffAtEnd: number;
    riskDiffAvg: number;
    goalsAffected: number;
  };
}

function computeRisk(monthlyNet: number, savings: number, monthlyExpenses: number): number {
  let risk = 50; // baseline
  
  // Emergency fund ratio (savings / 6 months expenses)
  const emergencyMonths = monthlyExpenses > 0 ? savings / monthlyExpenses : 12;
  if (emergencyMonths < 1) risk += 30;
  else if (emergencyMonths < 3) risk += 15;
  else if (emergencyMonths < 6) risk += 5;
  else risk -= 10;
  
  // Monthly net cash flow
  if (monthlyNet < 0) risk += 25;
  else if (monthlyNet < monthlyExpenses * 0.1) risk += 10;
  else if (monthlyNet > monthlyExpenses * 0.3) risk -= 15;
  
  return Math.max(0, Math.min(100, risk));
}

function projectYears(
  snapshot: FinancialSnapshot,
  scenario: Partial<Scenario>,
  years: number
): YearProjection[] {
  const income = snapshot.monthlyIncome * (1 + (scenario.incomeChangePercent || 0) / 100);
  const expenses = snapshot.monthlyExpenses + snapshot.monthlySubscriptions + (scenario.monthlyExpenseChange || 0);
  const extraSaving = scenario.extraMonthlySaving || 0;
  const monthlyNet = income - expenses + extraSaving;
  
  let savings = snapshot.totalSaved - (scenario.oneTimeExpense || 0);
  const results: YearProjection[] = [];
  
  for (let y = 0; y <= years; y++) {
    const goalsCompleted = snapshot.goals.filter(g => savings >= g.target - g.saved).length;
    results.push({
      year: y,
      savings: Math.round(savings),
      monthlyNet: Math.round(monthlyNet),
      goalsCompleted,
      totalGoals: snapshot.goals.length,
      riskScore: computeRisk(monthlyNet, savings, expenses),
    });
    // Apply annual growth (2% inflation on expenses, savings compound)
    savings += monthlyNet * 12;
    savings *= 1.02; // modest return
  }
  
  return results;
}

function findGoalCompletionMonth(
  snapshot: FinancialSnapshot,
  scenario: Partial<Scenario>,
  goal: { name: string; target: number; saved: number }
): number | null {
  const income = snapshot.monthlyIncome * (1 + (scenario.incomeChangePercent || 0) / 100);
  const expenses = snapshot.monthlyExpenses + snapshot.monthlySubscriptions + (scenario.monthlyExpenseChange || 0);
  const extraSaving = scenario.extraMonthlySaving || 0;
  const monthlyNet = income - expenses + extraSaving;
  
  let savings = snapshot.totalSaved - (scenario.oneTimeExpense || 0);
  const remaining = goal.target - goal.saved;
  
  if (savings >= remaining) return 0;
  if (monthlyNet <= 0) return null; // never
  
  for (let m = 1; m <= 240; m++) {
    savings += monthlyNet;
    if (m % 12 === 0) savings *= 1.02 / 12 * 12; // simplified annual return
    if (savings >= remaining) return m;
  }
  return null;
}

export function runSimulation(
  snapshot: FinancialSnapshot,
  scenario: Scenario
): SimulationResult {
  const baseline = projectYears(snapshot, {}, scenario.years);
  const scenarioProjection = projectYears(snapshot, scenario, scenario.years);
  
  const goalImpacts = snapshot.goals.map(g => {
    const baseMonth = findGoalCompletionMonth(snapshot, {}, g);
    const scenMonth = findGoalCompletionMonth(snapshot, scenario, g);
    return {
      name: g.name,
      baselineCompletionMonth: baseMonth,
      scenarioCompletionMonth: scenMonth,
      delayMonths: baseMonth !== null && scenMonth !== null ? scenMonth - baseMonth : null,
    };
  });
  
  const lastBaseline = baseline[baseline.length - 1];
  const lastScenario = scenarioProjection[scenarioProjection.length - 1];
  
  const baselineRiskAvg = baseline.reduce((s, y) => s + y.riskScore, 0) / baseline.length;
  const scenarioRiskAvg = scenarioProjection.reduce((s, y) => s + y.riskScore, 0) / scenarioProjection.length;
  
  return {
    baseline,
    scenario: scenarioProjection,
    goalImpacts,
    summaryStats: {
      savingsDiffAtEnd: lastScenario.savings - lastBaseline.savings,
      riskDiffAvg: Math.round(scenarioRiskAvg - baselineRiskAvg),
      goalsAffected: goalImpacts.filter(g => g.delayMonths !== null && g.delayMonths !== 0).length,
    },
  };
}

export const PRESET_SCENARIOS: Omit<Scenario, "years">[] = [
  { label: "What if I get a 15% raise?", incomeChangePercent: 15 },
  { label: "What if I buy a $1,200 phone?", oneTimeExpense: 1200 },
  { label: "What if I move to a cheaper city? (-$500/mo)", monthlyExpenseChange: -500 },
  { label: "What if I move to an expensive city? (+$800/mo)", monthlyExpenseChange: 800 },
  { label: "What if I save an extra $300/mo?", extraMonthlySaving: 300 },
  { label: "What if I lose my job? (-100% income)", incomeChangePercent: -100 },
];
