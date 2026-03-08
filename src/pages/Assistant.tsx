import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "How can I save more this month?",
  "Why did I overspend?",
  "Am I on track for my Singapore trip?",
  "What subscriptions should I cancel?",
];

const mockResponses: Record<string, string> = {
  default: "Based on your spending data, I can see some interesting patterns. You're currently saving 18% of your income which is solid. To improve, consider reducing food delivery spending — you're averaging $265/month there. Would you like me to create a budget plan?",
  "save": "Great question! Here are 3 ways to save more:\n\n1. **Reduce food delivery** — Cut from $265 to $150/month (save $115)\n2. **Cancel Hulu** — You rarely use it (save $12/month)\n3. **Coffee at home** — Brew instead of buying (save $70/month)\n\nTotal potential savings: **$197/month** 💰",
  "overspend": "You overspent by $340 this month. Here's why:\n\n• **Food delivery**: 38% above budget (+$85)\n• **Shopping**: Impulse purchases of $380\n• **Entertainment**: Weekend spending spike\n\nYour Saturday spending is 42% higher than weekday average. Try setting a weekend spending limit!",
  "singapore": "Your Singapore trip goal is at **62%** ($1,850 of $3,000).\n\n📊 **Forecast**: At current pace, you'll reach it in **4.2 months**\n✅ **Goal probability**: 78%\n\n💡 If you reduce food delivery by $45/week, you'll reach it **2 weeks earlier**!",
  "subscription": "You have 6 active subscriptions totaling **$153.95/month** ($1,847/year):\n\n🔴 Consider cancelling:\n• **Adobe Creative** ($54.99) — Used only 3 times last month\n\n🟡 Consider downgrading:\n• **Netflix** ($15.99) — Switch to Standard plan\n\nPotential savings: **$62/month**",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("save")) return mockResponses["save"];
  if (lower.includes("overspend") || lower.includes("why")) return mockResponses["overspend"];
  if (lower.includes("singapore") || lower.includes("track") || lower.includes("goal")) return mockResponses["singapore"];
  if (lower.includes("subscription") || lower.includes("cancel")) return mockResponses["subscription"];
  return mockResponses["default"];
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Hey! 👋 I'm your AI financial coach. Ask me anything about your spending, goals, or how to save more. I have access to all your financial data and can provide personalized recommendations." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(text);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-3rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">AI Financial Coach</h1>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
            <span className="text-xs text-muted-foreground">Online · Analyzing your data</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 shrink-0 mt-1">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "glass-card"
            }`}>
              <p className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</p>
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0 mt-1">
                <User className="h-4 w-4 text-foreground" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 shrink-0">
              <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
            </div>
            <div className="glass-card px-4 py-3 rounded-xl">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 pb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Ask about your finances..."
          className="flex-1"
        />
        <Button onClick={() => send(input)} size="icon" disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
