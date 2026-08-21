import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/features/shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

export default function Assistant() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: i18n.language.startsWith("fr")
      ? "Bonjour, je suis votre assistant Mémoire. Comment puis-je vous aider aujourd'hui ?"
      : "Hello, I'm your Mémoire assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg], language: i18n.language }),
      });
      if (resp.status === 429) { toast.error(t("ai.rateLimit")); setLoading(false); return; }
      if (resp.status === 402) { toast.error(t("ai.creditsOut")); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("AI error");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantText } : m));
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e: any) {
      toast.error(e.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout hideNav>
      <div className="flex flex-col h-screen -m-4 max-w-md mx-auto">
        <header className="flex items-center gap-3 p-4 border-b">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="size-5" /></button>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-warm flex items-center justify-center">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-lg">{t("ai.title")}</h1>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user" ? "bg-gradient-warm text-primary-foreground" : "bg-muted text-foreground"
              }`}>
                {m.content || <Loader2 className="size-4 animate-spin" />}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex gap-2 bg-card">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={t("ai.placeholder")}
            disabled={loading}
            className="rounded-xl"
          />
          <Button onClick={send} disabled={loading || !input.trim()} className="bg-gradient-warm">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
