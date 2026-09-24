import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Headphones, Settings2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type {
  AccompanimentPreference,
  AssistanceLevel,
  AudioPreference,
  InterfaceLevel,
  UsageContext,
} from "@/core/types/domain";
import { useUsagePreferences } from "../hooks/useUsagePreferences";

type SelectOption = { value: string; label: string };

function PreferenceSelect({
  id,
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-ring disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

export function UsagePreferencesCard() {
  const { t } = useTranslation();
  const { preferences, loading, update } = useUsagePreferences();
  const [saving, setSaving] = useState(false);

  if (loading || !preferences) {
    return <section className="card-soft p-5 mb-4 h-28 animate-pulse" aria-label={t("usage.loading")} />;
  }

  const save = async (patch: Parameters<typeof update>[0]) => {
    setSaving(true);
    try {
      await update(patch);
      toast.success(t("usage.saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    } finally {
      setSaving(false);
    }
  };

  const applyMode = (mode: "ruralEssential" | "ruralAutonomous" | "modern") => {
    if (mode === "ruralEssential") {
      void save({
        context_type: "rural",
        assistance_level: "assiste",
        interface_level: "essentiel",
        audio_preference: "prefere",
      });
    } else if (mode === "ruralAutonomous") {
      void save({
        context_type: "rural",
        assistance_level: "autonome",
        interface_level: "standard",
        audio_preference: "optionnel",
      });
    } else {
      void save({
        assistance_level: "autonome",
        interface_level: "complet",
        audio_preference: "optionnel",
      });
    }
  };

  const selectedMode =
    preferences.interface_level === "essentiel"
      ? "ruralEssential"
      : preferences.context_type === "rural" && preferences.interface_level === "standard"
        ? "ruralAutonomous"
        : preferences.interface_level === "complet"
          ? "modern"
          : null;

  return (
    <section className="card-soft p-5 mb-4 space-y-4">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Settings2 className="size-4" /> {t("usage.title")}
        </h2>
        <p className="text-caption mt-1">{t("usage.hint")}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {(["ruralEssential", "ruralAutonomous", "modern"] as const).map((mode) => (
          <Button
            key={mode}
            type="button"
            variant={selectedMode === mode ? "default" : "outline"}
            disabled={saving}
            onClick={() => applyMode(mode)}
            className="h-auto min-h-11 whitespace-normal"
          >
            {t(`usage.modes.${mode}`)}
          </Button>
        ))}
      </div>

      <PreferenceSelect
        id="usage-context"
        label={t("usage.context")}
        value={preferences.context_type}
        disabled={saving}
        options={[
          { value: "rural", label: t("usage.values.rural") },
          { value: "urbain", label: t("usage.values.urbain") },
        ]}
        onChange={(value) => void save({ context_type: value as UsageContext })}
      />
      <PreferenceSelect
        id="usage-assistance"
        label={t("usage.assistance")}
        value={preferences.assistance_level}
        disabled={saving}
        options={[
          { value: "autonome", label: t("usage.values.autonome") },
          { value: "assiste", label: t("usage.values.assiste") },
        ]}
        onChange={(value) => void save({ assistance_level: value as AssistanceLevel })}
      />
      <PreferenceSelect
        id="usage-interface"
        label={t("usage.interface")}
        value={preferences.interface_level}
        disabled={saving}
        options={[
          { value: "essentiel", label: t("usage.values.essentiel") },
          { value: "standard", label: t("usage.values.standard") },
          { value: "complet", label: t("usage.values.complet") },
        ]}
        onChange={(value) => void save({ interface_level: value as InterfaceLevel })}
      />
      <PreferenceSelect
        id="usage-audio"
        label={t("usage.audio")}
        value={preferences.audio_preference}
        disabled={saving}
        options={[
          { value: "prefere", label: t("usage.values.prefere") },
          { value: "optionnel", label: t("usage.values.optionnel") },
        ]}
        onChange={(value) => void save({ audio_preference: value as AudioPreference })}
      />
      <div className="flex items-center gap-2 text-caption">
        <Headphones className="size-4" />
        <span>{t("usage.audioNote")}</span>
      </div>
      <PreferenceSelect
        id="usage-accompaniment"
        label={t("usage.accompaniment")}
        value={preferences.accompaniment_preference}
        disabled={saving}
        options={[
          { value: "seul", label: t("usage.values.seul") },
          { value: "accompagne", label: t("usage.values.accompagne") },
        ]}
        onChange={(value) => void save({ accompaniment_preference: value as AccompanimentPreference })}
      />
      <div className="flex items-center gap-2 text-caption">
        <Users className="size-4" />
        <span>{t("usage.permissionsNote")}</span>
      </div>
    </section>
  );
}
