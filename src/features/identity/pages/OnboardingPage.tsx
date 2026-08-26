import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { alertsRepo, profilesRepo } from "@/data";
import { useAuth } from "../hooks/useAuth";

export default function OnboardingPage() {
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

  const finish = async (allAnswers: Record<string, boolean>) => {
    if (!user) return;
    setSaving(true);
    try {
      await profilesRepo.completeOnboarding(user.id, allAnswers);
      if (allAnswers.has_land) {
        await alertsRepo.createAlert({
          user_id: user.id,
          type: "suggestion",
          severity: "medium",
          title: t("home.quickSecure"),
          message: t("onboarding.firstSuggestion"),
          action_label: t("home.quickSecure"),
          action_route: "/create?type=terrain",
        });
      }
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    } finally {
      setSaving(false);
    }
  };

  const answer = (value: boolean) => {
    const current = questions[step];
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    if (step < questions.length - 1) setStep(step + 1);
    else void finish(next);
  };

  const question = questions[step];

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
          <p className="text-lg font-medium text-center min-h-[3rem]">{question.label}</p>
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
