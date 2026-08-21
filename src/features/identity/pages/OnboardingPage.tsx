import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const questions = [
    { key: "has_land", label: t("onboarding.q1") },
    { key: "wants_heritage", label: t("onboarding.q2") },
    { key: "wants_will", label: t("onboarding.q3") },
  ];

  const answer = async (val: boolean) => {
    const q = questions[step];
    const next = { ...answers, [q.key]: val };
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setSaving(true);
      try {
        await supabase.from("profiles").update({
          onboarding_completed: true,
          onboarding_answers: next,
        }).eq("id", user!.id);

        // First proactive alert
        if (next.has_land) {
          await supabase.from("alerts").insert({
            user_id: user!.id,
            type: "suggestion",
            severity: "medium",
            title: t("home.quickSecure"),
            message: "Commencez par créer un dossier pour votre terrain.",
            action_label: t("home.quickSecure"),
            action_route: "/create",
          });
        }
        navigate("/");
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setSaving(false);
      }
    }
  };

  const q = questions[step];

  return (
    <div className="min-h-screen bg-gradient-earth flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="size-14 rounded-2xl bg-gradient-warm flex items-center justify-center shadow-warm">
            <Sparkles className="size-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-serif text-center mb-2">{t("onboarding.title")}</h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">{t("onboarding.subtitle")}</p>

        <div className="card-soft p-6 space-y-6">
          <div className="flex gap-2 justify-center">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <p className="text-lg font-medium text-center min-h-[3rem]">{q.label}</p>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => answer(false)} disabled={saving} variant="outline" size="lg">
              {t("onboarding.no")}
            </Button>
            <Button onClick={() => answer(true)} disabled={saving} size="lg" className="bg-gradient-warm">
              {saving && <Loader2 className="size-4 animate-spin" />} {t("onboarding.yes")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
