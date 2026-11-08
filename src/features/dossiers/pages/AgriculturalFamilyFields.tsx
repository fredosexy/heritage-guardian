import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Family = "exploitation" | "plantation" | "elevage" | "equipement" | "infrastructure" | "autre";
type Field = { key: string; type?: "text" | "number" | "date"; step?: string };

const FIELDS: Record<Family, Field[]> = {
  exploitation: [{ key: "activities" }, { key: "activeSince", type: "date" }],
  plantation: [{ key: "cropType" }, { key: "variety" }, { key: "declaredArea", type: "number", step: "any" }, { key: "areaUnit" }, { key: "plantedPeriod" }],
  elevage: [{ key: "animalType" }, { key: "declaredQuantity", type: "number", step: "1" }, { key: "inventoryDate", type: "date" }],
  equipement: [{ key: "equipmentType" }, { key: "brand" }, { key: "model" }, { key: "serialNumber" }, { key: "condition" }],
  infrastructure: [{ key: "infrastructureType" }, { key: "use" }, { key: "condition" }],
  autre: [{ key: "nature" }, { key: "characteristics" }],
};

export function AgriculturalFamilyFields({
  family,
  value,
  onChange,
}: {
  family: Family;
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  const { t } = useTranslation();
  const requiredByFamily: Record<Family, string[]> = {
    exploitation: ["activities", "activeSince"],
    plantation: ["cropType", "declaredArea", "areaUnit"],
    elevage: ["animalType", "declaredQuantity", "inventoryDate"],
    equipement: ["equipmentType", "condition"],
    infrastructure: ["infrastructureType", "use"],
    autre: ["nature", "characteristics"],
  };
  const recommended = requiredByFamily[family];
  const missing = recommended.filter((key) => !String(value[key] ?? "").trim());
  const completed = recommended.length - missing.length;
  const focusField = (key: string) => {
    const field = document.getElementById("agricultural-field-" + key);
    field?.focus();
    field?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-background/50 p-4" aria-labelledby="agricultural-family-fields-title">
      <div>
        <h2 id="agricultural-family-fields-title" className="text-sm font-semibold">{t("agricultural.structuredTitle")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t("agricultural.structuredHint")}</p>
      </div>
      <div className="rounded-xl border border-primary/15 bg-accent/25 p-3" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold">{t("agricultural.assistant.title")}</p>
          <span className="text-xs tabular-nums text-muted-foreground">{completed}/{recommended.length}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={recommended.length} aria-valuenow={completed} aria-label={t("agricultural.assistant.progress")}>
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: ((completed / recommended.length) * 100) + "%" }} />
        </div>
        {missing.length > 0 ? (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">{t("agricultural.assistant.nextStep")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {missing.slice(0, 3).map((key) => (
                <button key={key} type="button" onClick={() => focusField(key)} className="min-h-9 rounded-full border border-border bg-background px-3 text-xs font-medium focus-ring">
                  {t("agricultural.fields." + family + "." + key)}
                </button>
              ))}
            </div>
          </div>
        ) : <p className="mt-2 text-xs text-primary">{t("agricultural.assistant.complete")}</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS[family].map((field) => {
          const id = "agricultural-field-" + field.key;
          return (
            <div key={field.key}>
              <Label htmlFor={id}>{t("agricultural.fields." + family + "." + field.key)}</Label>
              <Input
                id={id}
                type={field.type ?? "text"}
                min={field.type === "number" ? "0" : undefined}
                step={field.step}
                value={value[field.key] ?? ""}
                onChange={(event) => onChange({ ...value, [field.key]: event.target.value })}
                className="mt-1.5 min-h-12 rounded-2xl"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
