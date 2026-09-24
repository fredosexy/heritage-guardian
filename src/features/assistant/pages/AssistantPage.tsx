import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/features/shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AiUnavailableError, streamChat, type ChatMessage } from "@/services";

export default function AssistantPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: t("ai.welcome") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoSent = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendText = useCallback(
    async (text: string) => {
      if (!text) return;
      const history: ChatMessage[] = [
        { role: "assistant", content: t("ai.welcome") },
        { role: "user", content: text },
      ];
      setMessages(history);
      setLoading(true);

      try {
        setMessages([...history, { role: "assistant", content: "" }]);
        await streamChat({
          messages: history,
          language: i18n.language,
          onDelta: (full) =>
            setMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: full } : m))),
        });
      } catch (error) {
        if (error instanceof AiUnavailableError) {
          toast.error(
            error.reason === "unauthorized"
              ? t("ai.authRequired")
              : error.reason === "rate_limit"
              ? t("ai.rateLimit")
              : error.reason === "credits"
              ? t("ai.creditsOut")
              : t("ai.error")
          );
        } else {
          toast.error(t("ai.error"));
        }
        setMessages(history);
      } finally {
        setLoading(false);
      }
    },
    [i18n.language, t]
  );

  /** Question posée depuis un conseil contextuel : envoyée automatiquement. */
  useEffect(() => {
    const q = searchParams.get("q");
    if (!q || autoSent.current) return;
    autoSent.current = true;
    setSearchParams({}, { replace: true });
    void sendText(q.trim());
  }, [searchParams, setSearchParams, sendText]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setLoading(true);

    try {
      setMessages([...history, { role: "assistant", content: "" }]);
      await streamChat({
        messages: history,
        language: i18n.language,
        onDelta: (full) =>
          setMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: full } : m))),
      });
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        toast.error(
          error.reason === "unauthorized"
            ? t("ai.authRequired")
            : error.reason === "rate_limit"
            ? t("ai.rateLimit")
            : error.reason === "credits"
            ? t("ai.creditsOut")
            : t("ai.error")
        );
      } else {
        toast.error(t("ai.error"));
      }
      setMessages(history);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout hideNav>
      <div className="flex flex-col h-screen -m-4 max-w-md mx-auto">
        <header className="flex items-center gap-3 p-4 border-b">
          <button onClick={() => navigate(-1)} className="p-1" aria-label={t("common.back")}>
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-warm flex items-center justify-center">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <h1 className="text-title">{t("ai.title")}</h1>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user" ? "bg-gradient-warm text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
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
