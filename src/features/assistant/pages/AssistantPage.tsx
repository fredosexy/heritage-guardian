import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/features/shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AiUnavailableError, streamChat, type ChatMessage } from "@/services";
import { DOSSIER_TYPES, typeLabelKey } from "@/features/dossiers/components/dossierTypeMeta";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useIdentity } from "@/features/identity";

export default function AssistantPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isGuest } = useIdentity();
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleId = searchParams.get("module");
  const moduleMeta = DOSSIER_TYPES.find((item) => item.id === moduleId);
  const moduleStepsValue = moduleId ? t("modules." + moduleId + ".steps", { returnObjects: true }) : [];
  const moduleSteps = Array.isArray(moduleStepsValue) ? moduleStepsValue as string[] : [];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: t("ai.welcome") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoSent = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [messages]);

  const sendText = useCallback(
    async (text: string) => {
      if (!text || isGuest) return;
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
            error.reason === "rate_limit"
              ? t("ai.rateLimit")
              : error.reason === "credits"
              ? t("ai.creditsOut")
              : error.reason === "auth_required"
              ? t("ai.authRequired")
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
    [i18n.language, isGuest, t]
  );

  /** Question posée depuis un conseil contextuel : envoyée automatiquement. */
  useEffect(() => {
    const q = searchParams.get("q");
    if (!q || autoSent.current || isGuest) return;
    autoSent.current = true;
    setSearchParams({}, { replace: true });
    void sendText(q.trim());
  }, [searchParams, setSearchParams, sendText, isGuest]);

  const send = async () => {
    const text = input.trim();
    if (isGuest || !text || loading) return;
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
          error.reason === "rate_limit"
            ? t("ai.rateLimit")
            : error.reason === "credits"
            ? t("ai.creditsOut")
            : error.reason === "auth_required"
            ? t("ai.authRequired")
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
    <AppLayout hideNav fullScreen>
      <div className="flex h-full min-h-0 w-full max-w-md mx-auto flex-col">
        <header className="flex items-center gap-3 p-4 border-b border-border/60 bg-background/80 backdrop-blur-md">
          <button onClick={() => navigate(-1)} className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-card/80 shadow-[var(--shadow-soft)] transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={t("common.back")}>
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-primary/15 via-secondary/70 to-accent flex items-center justify-center shadow-[var(--shadow-soft)]">
              <Sparkles className="size-5 text-primary" />
            </div>
            <h1 className="text-title">{t("ai.title")}</h1>
          </div>
          <div className="ml-auto"><ThemeToggle /></div>
        </header>

        {isGuest ? (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mx-auto max-w-sm space-y-5">
              <div className="space-y-2">
                <p className="text-base font-semibold">{t("assistantVisitor.title")}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{t("assistantVisitor.description")}</p>
              </div>
              <div className="grid gap-2">
                {[
                  ["terrain", "assistantVisitor.choices.terrain"],
                  ["heritage", "assistantVisitor.choices.heritage"],
                  ["volonte", "assistantVisitor.choices.volonte"],
                  ["conflit", "assistantVisitor.choices.conflit"],
                ].map(([id, labelKey]) => (
                  <Button key={id} type="button" variant="outline" className="h-auto min-h-12 justify-between whitespace-normal rounded-xl py-3 text-left" onClick={() => navigate(`/modules/${id}`)}>
                    <span>{t(labelKey)}</span><ArrowLeft className="size-4 rotate-180" aria-hidden="true" />
                  </Button>
                ))}
              </div>
              <div className="rounded-2xl bg-muted/70 p-4">
                <p className="text-sm text-muted-foreground">{t("assistantVisitor.accountHint")}</p>
                <Button type="button" className="mt-3 w-full" onClick={() => navigate("/auth")}>{t("home.createAccountToContinue")}</Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-background via-background to-secondary/10 p-4 space-y-4" role="log" aria-live="polite" aria-relevant="additions text">
              {moduleMeta && <section className="rounded-2xl border border-border bg-card p-3 space-y-2"><p className="text-xs uppercase tracking-wide text-primary font-medium">{t("modules.label")}</p><p className="font-semibold">{moduleId === "savoir" ? t(typeLabelKey(moduleId)) : t("modules." + moduleId + ".title")}</p><p className="text-sm text-muted-foreground">{moduleId === "savoir" ? t(moduleMeta.descKey ?? "create.savoirDesc") : t("modules." + moduleId + ".longDescription")}</p>{moduleSteps.length > 0 && <div className="flex flex-wrap gap-2">{moduleSteps.slice(0, 4).map((step) => <Button key={step} type="button" variant="outline" size="sm" className="rounded-xl text-left whitespace-normal h-auto" onClick={() => setInput(step)}>{step}</Button>)}</div>}</section>}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user" ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "border border-border/60 bg-card/90 text-foreground shadow-[var(--shadow-soft)]"
                  }`}>
                    {m.content || <Loader2 className="size-4 animate-spin" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border/60 flex items-end gap-2 bg-background/90 backdrop-blur-md">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder={t("ai.placeholder")}
                disabled={loading}
                className="min-h-11 rounded-2xl border-border/70 bg-card shadow-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t("ai.placeholder")}
              />
              <Button type="button" onClick={send} disabled={loading || !input.trim()} aria-label={t("ai.title")} className="size-11 shrink-0 rounded-2xl shadow-[var(--shadow-soft)] transition hover:brightness-105">
                <Send className="size-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
