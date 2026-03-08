import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, Trash2, RefreshCw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface FinancialContext {
  expenses: { category: string; amount: number; merchant: string; date: string }[];
  goals: { name: string; target: number; saved: number; deadline: string }[];
  subscriptions: { name: string; amount: number; cycle: string }[];
  budgets: { category: string; monthly_limit: number }[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const suggestions = [
  "How can I save more this month?",
  "Analyze my spending patterns",
  "Am I on track for my goals?",
  "What subscriptions should I cancel?",
  "Where am I overspending?",
  "Give me a budget tip",
];

export default function Assistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Hey! 👋 I'm your AI financial coach. I have access to your spending, goals, and subscriptions. Ask me anything about your finances!" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<FinancialContext | null>(null);
  const [contextLoaded, setContextLoaded] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load financial context
  const loadContext = useCallback(async () => {
    if (!user) return;
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const [expensesRes, goalsRes, subscriptionsRes, budgetsRes] = await Promise.all([
      supabase
        .from("expenses")
        .select("category, amount, merchant, date")
        .gte("date", ninetyDaysAgo.toISOString().split("T")[0])
        .order("date", { ascending: false })
        .limit(100),
      supabase.from("goals").select("name, target, saved, deadline"),
      supabase.from("subscriptions").select("name, amount, cycle"),
      supabase.from("budgets").select("category, monthly_limit"),
    ]);

    setContext({
      expenses: (expensesRes.data || []).map(e => ({ ...e, amount: Number(e.amount) })),
      goals: (goalsRes.data || []).map(g => ({ ...g, target: Number(g.target), saved: Number(g.saved) })),
      subscriptions: (subscriptionsRes.data || []).map(s => ({ ...s, amount: Number(s.amount) })),
      budgets: (budgetsRes.data || []).map(b => ({ ...b, monthly_limit: Number(b.monthly_limit) })),
    });
    setContextLoaded(true);
  }, [user]);

  useEffect(() => { loadContext(); }, [loadContext]);

  // Load chat history
  useEffect(() => {
    if (!user) return;
    supabase
      .from("chat_messages")
      .select("*")
      .order("created_at")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMessages([
            { id: "1", role: "assistant", content: "Hey! 👋 I'm your AI financial coach. I have access to your spending, goals, and subscriptions. Ask me anything about your finances!" },
            ...data.map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })),
          ]);
        }
      });
  }, [user]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading || !user) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Save user message
    await supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: text });

    let assistantSoFar = "";
    const allMessages = [...messages.filter((m) => m.id !== "1"), userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          context: context, // Send financial context
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get response");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id === "streaming") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { id: "streaming", role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message
      if (assistantSoFar) {
        const { data: saved } = await supabase
          .from("chat_messages")
          .insert({ user_id: user.id, role: "assistant", content: assistantSoFar })
          .select("id")
          .single();
        setMessages((prev) =>
          prev.map((m) => (m.id === "streaming" ? { ...m, id: saved?.id || Date.now().toString() } : m))
        );
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: `Sorry, I couldn't respond. ${e.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from("chat_messages").delete().eq("user_id", user.id);
    setMessages([
      { id: "1", role: "assistant", content: "Hey! 👋 I'm your AI financial coach. I have access to your spending, goals, and subscriptions. Ask me anything about your finances!" },
    ]);
    toast({ title: "Chat cleared", description: "Your conversation history has been deleted." });
  };

  const refreshContext = async () => {
    await loadContext();
    toast({ title: "Data refreshed", description: "Your latest financial data is now loaded." });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-3rem)] lg:h-[calc(100vh-3rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">AI Financial Coach</h1>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs text-muted-foreground">Online · Powered by AI</span>
            {contextLoaded && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                <Database className="h-3 w-3" />
                Data synced
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={refreshContext} className="text-muted-foreground hover:text-primary" title="Refresh data">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {messages.length > 1 && (
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground hover:text-destructive" title="Clear history">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Context Summary */}
      {context && (context.expenses.length > 0 || context.goals.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4 text-[10px]">
          {context.expenses.length > 0 && (
            <span className="bg-muted px-2 py-1 rounded-full">
              📊 {context.expenses.length} expenses tracked
            </span>
          )}
          {context.goals.length > 0 && (
            <span className="bg-muted px-2 py-1 rounded-full">
              🎯 {context.goals.length} active goals
            </span>
          )}
          {context.subscriptions.length > 0 && (
            <span className="bg-muted px-2 py-1 rounded-full">
              📦 {context.subscriptions.length} subscriptions
            </span>
          )}
          {context.budgets.length > 0 && (
            <span className="bg-muted px-2 py-1 rounded-full">
              📋 {context.budgets.length} budgets
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-1">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] sm:max-w-[80%] rounded-xl px-4 py-3 text-sm ${
              msg.role === "user" ? "bg-primary text-primary-foreground" : "glass-card"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>p:last-child]:mb-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0 mt-1">
                <User className="h-4 w-4 text-foreground" />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
            </div>
            <div className="glass-card px-4 py-3 rounded-xl">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
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
              className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about your finances..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button onClick={() => send(input)} size="icon" disabled={!input.trim() || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
