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
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-background/50 p-4" aria-labelledby="agricultural-family-fields-title">
      <div>
        <h2 id="agricultural-family-fields-title" className="text-sm font-semibold">{t("agricultural.structuredTitle")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t("agricultural.structuredHint")}</p>
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
