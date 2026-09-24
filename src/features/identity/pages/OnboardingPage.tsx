import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { alertsRepo, profilesRepo, usagePreferencesRepo } from "@/data";
import type { UsagePreferencesPatch } from "@/data/usage-preferences.repo";
import { useAuth } from "../hooks/useAuth";

type PreferenceKey = keyof UsagePreferencesPatch;

export default function OnboardingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preferenceStep, setPreferenceStep] = useState(0);
  const [businessStep, setBusinessStep] = useState(0);
  const [collectingUsage, setCollectingUsage] = useState(true);
  const [preferences, setPreferences] = useState<UsagePreferencesPatch>({});
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const preferenceQuestions = useMemo<Array<{
    key: PreferenceKey;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>>(() => [
    {
      key: "context_type",
      label: t("onboarding.usageContext"),
      options: [
        { value: "rural", label: t("usage.values.rural") },
        { value: "urbain", label: t("usage.values.urbain") },
      ],
    },
    {
      key: "audio_preference",
      label: t("onboarding.usageAudio"),
      options: [
        { value: "prefere", label: t("usage.values.prefere") },
        { value: "optionnel", label: t("usage.values.optionnel") },
      ],
    },
    {
      key: "assistance_level",
      label: t("onboarding.usageAssistance"),
      options: [
        { value: "autonome", label: t("usage.values.autonome") },
        { value: "assiste", label: t("usage.values.assiste") },
      ],
    },
    {
      key: "interface_level",
      label: t("onboarding.usageInterface"),
      options: [
        { value: "essentiel", label: t("usage.values.essentiel") },
        { value: "standard", label: t("usage.values.standard") },
        { value: "complet", label: t("usage.values.complet") },
      ],
    },
    {
      key: "accompaniment_preference",
      label: t("onboarding.usageAccompaniment"),
      options: [
        { value: "seul", label: t("usage.values.seul") },
        { value: "accompagne", label: t("usage.values.accompagne") },
      ],
    },
  ], [t]);

  const businessQuestions = [
    { key: "has_land", label: t("onboarding.q1") },
    { key: "wants_heritage", label: t("onboarding.q2") },
    { key: "wants_will", label: t("onboarding.q3") },
  ];

  const finish = async (allAnswers: Record<string, boolean>) => {
    if (!user) return;
    setSaving(true);
    try {
      await usagePreferencesRepo.updateUsagePreferences(user.id, preferences);
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

  const choosePreference = (value: string) => {
    const current = preferenceQuestions[preferenceStep];
    setPreferences((previous) => ({ ...previous, [current.key]: value }));
    if (preferenceStep < preferenceQuestions.length - 1) {
      setPreferenceStep((currentStep) => currentStep + 1);
    } else {
      setCollectingUsage(false);
    }
  };

  const answerBusiness = (value: boolean) => {
    const current = businessQuestions[businessStep];
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    if (businessStep < businessQuestions.length - 1) {
      setBusinessStep((currentStep) => currentStep + 1);
    } else {
      void finish(next);
    }
  };

  const totalSteps = preferenceQuestions.length + businessQuestions.length;
  const currentIndex = collectingUsage
    ? preferenceStep
    : preferenceQuestions.length + businessStep;
  const questionLabel = collectingUsage
    ? preferenceQuestions[preferenceStep].label
    : businessQuestions[businessStep].label;

  return (
    <div className="min-h-screen bg-gradient-earth flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="size-14 rounded-2xl bg-gradient-warm flex items-center justify-center shadow-warm">
            <Sparkles className="size-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-display text-center mb-2">{t("onboarding.title")}</h1>
        <p className="text-center text-muted-foreground mb-8 text-sm">{t("onboarding.subtitle")}</p>

        <div className="card-soft p-6 space-y-6">
          <div className="flex gap-1.5 justify-center" aria-label={t("onboarding.progress", { current: currentIndex + 1, total: totalSteps })}>
            {Array.from({ length: totalSteps }, (_, index) => (
              <div key={index} className={`h-1.5 flex-1 max-w-8 rounded-full transition ${index <= currentIndex ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <p className="text-lg font-medium text-center min-h-[3rem]">{questionLabel}</p>

          {collectingUsage ? (
            <div className="grid gap-3">
              {preferenceQuestions[preferenceStep].options.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={saving}
                  onClick={() => choosePreference(option.value)}
                  className="h-auto min-h-12 whitespace-normal"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => answerBusiness(false)} disabled={saving} variant="outline" size="lg">
                {t("onboarding.no")}
              </Button>
              <Button onClick={() => answerBusiness(true)} disabled={saving} size="lg" className="bg-gradient-warm">
                {saving && <Loader2 className="size-4 animate-spin" />} {t("onboarding.yes")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
