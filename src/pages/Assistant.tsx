import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const suggestions = [
  "How can I save more this month?",
  "What's the best budgeting strategy?",
  "Am I on track for my goals?",
  "What subscriptions should I cancel?",
];

export default function Assistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Hey! 👋 I'm your AI financial coach. Ask me anything about your spending, goals, or how to save more." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
            { id: "1", role: "assistant", content: "Hey! 👋 I'm your AI financial coach. Ask me anything about your spending, goals, or how to save more." },
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
      { id: "1", role: "assistant", content: "Hey! 👋 I'm your AI financial coach. Ask me anything about your spending, goals, or how to save more." },
    ]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-3rem)] lg:h-[calc(100vh-3rem)] max-w-3xl mx-auto">
      <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">AI Financial Coach</h1>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs text-muted-foreground">Online · Powered by AI</span>
          </div>
        </div>
        {messages.length > 1 && (
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

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
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
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

      <div className="flex gap-2 pt-2 border-t border-border">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about your finances..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button onClick={() => send(input)} size="icon" disabled={!input.trim() || isLoading} className="bg-primary text-primary-foreground hover:bg-teal-light">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
