export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  category: "travel" | "gadget" | "emergency" | "investment" | "education";
  priority: "high" | "medium" | "low";
  icon: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  merchant: string;
  date: string;
  paymentMethod: string;
  note?: string;
  logo?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  cycle: "monthly" | "yearly";
  nextBilling: string;
  category: string;
  logo: string;
}

export const goals: Goal[] = [
  { id: "1", name: "Trip to Singapore", target: 3000, saved: 1850, deadline: "2026-06-15", category: "travel", priority: "high", icon: "✈️" },
  { id: "2", name: "MacBook Pro", target: 2500, saved: 800, deadline: "2026-09-01", category: "gadget", priority: "medium", icon: "💻" },
  { id: "3", name: "Emergency Fund", target: 10000, saved: 4200, deadline: "2026-12-31", category: "emergency", priority: "high", icon: "🛡️" },
  { id: "4", name: "Stock Portfolio", target: 5000, saved: 1500, deadline: "2026-08-01", category: "investment", priority: "medium", icon: "📈" },
];

export const expenses: Expense[] = [
  { id: "1", amount: 45.50, category: "Food", merchant: "Uber Eats", date: "2026-03-08", paymentMethod: "Credit Card", note: "Dinner", logo: "https://logo.clearbit.com/ubereats.com" },
  { id: "2", amount: 120.00, category: "Shopping", merchant: "Amazon", date: "2026-03-07", paymentMethod: "Debit Card", note: "Headphones", logo: "https://logo.clearbit.com/amazon.com" },
  { id: "3", amount: 35.00, category: "Transport", merchant: "Uber", date: "2026-03-07", paymentMethod: "Credit Card", logo: "https://logo.clearbit.com/uber.com" },
  { id: "4", amount: 85.00, category: "Food", merchant: "Whole Foods", date: "2026-03-06", paymentMethod: "Debit Card", note: "Weekly groceries", logo: "https://logo.clearbit.com/wholefoodsmarket.com" },
  { id: "5", amount: 15.99, category: "Entertainment", merchant: "Netflix", date: "2026-03-05", paymentMethod: "Credit Card", logo: "https://logo.clearbit.com/netflix.com" },
  { id: "6", amount: 60.00, category: "Bills", merchant: "Electric Co", date: "2026-03-04", paymentMethod: "Bank Transfer" },
  { id: "7", amount: 4.50, category: "Food", merchant: "Starbucks", date: "2026-03-08", paymentMethod: "Apple Pay", note: "Morning coffee", logo: "https://logo.clearbit.com/starbucks.com" },
  { id: "8", amount: 29.99, category: "Shopping", merchant: "Target", date: "2026-03-03", paymentMethod: "Credit Card", logo: "https://logo.clearbit.com/target.com" },
];

export const subscriptions: Subscription[] = [
  { id: "1", name: "Netflix", amount: 15.99, cycle: "monthly", nextBilling: "2026-04-05", category: "Entertainment", logo: "https://logo.clearbit.com/netflix.com" },
  { id: "2", name: "Spotify", amount: 9.99, cycle: "monthly", nextBilling: "2026-03-20", category: "Entertainment", logo: "https://logo.clearbit.com/spotify.com" },
  { id: "3", name: "iCloud+", amount: 2.99, cycle: "monthly", nextBilling: "2026-03-15", category: "Cloud", logo: "https://logo.clearbit.com/apple.com" },
  { id: "4", name: "Gym Membership", amount: 49.99, cycle: "monthly", nextBilling: "2026-04-01", category: "Health", logo: "https://logo.clearbit.com/planetfitness.com" },
  { id: "5", name: "ChatGPT Plus", amount: 20.00, cycle: "monthly", nextBilling: "2026-03-22", category: "Software", logo: "https://logo.clearbit.com/openai.com" },
  { id: "6", name: "Adobe Creative", amount: 54.99, cycle: "monthly", nextBilling: "2026-03-28", category: "Software", logo: "https://logo.clearbit.com/adobe.com" },
];

export const spendingByCategory = [
  { category: "Food", amount: 580, color: "hsl(174, 72%, 46%)" },
  { category: "Shopping", amount: 420, color: "hsl(38, 95%, 55%)" },
  { category: "Transport", amount: 210, color: "hsl(258, 60%, 62%)" },
  { category: "Entertainment", amount: 180, color: "hsl(12, 80%, 58%)" },
  { category: "Bills", amount: 340, color: "hsl(200, 80%, 50%)" },
];

export const weeklySpending = [
  { day: "Mon", amount: 45 },
  { day: "Tue", amount: 82 },
  { day: "Wed", amount: 35 },
  { day: "Thu", amount: 120 },
  { day: "Fri", amount: 95 },
  { day: "Sat", amount: 180 },
  { day: "Sun", amount: 65 },
];

export const categoryIcons: Record<string, string> = {
  Food: "🍔",
  Shopping: "🛍️",
  Transport: "🚗",
  Entertainment: "🎬",
  Bills: "📄",
  Health: "💪",
  Cloud: "☁️",
  Software: "💻",
  Investments: "📈",
  Savings: "🏦",
};
