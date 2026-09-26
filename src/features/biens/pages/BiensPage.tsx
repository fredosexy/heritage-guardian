import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Plus, UserRound } from "lucide-react";
import { AppLayout } from "@/features/shell";
import { Button } from "@/components/ui/button";
import { biensRepo } from "@/data";
import type { Bien } from "@/core/types/domain";

export default function BiensPage() {
  const { t } = useTranslation();
  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBiens(await biensRepo.getBiensForUser());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <AppLayout>
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-display">{t("biens.title")}</h1>
          <p className="text-caption mt-1">{t("biens.subtitle")}</p>
        </div>
        <Button asChild className="bg-gradient-warm shrink-0">
          <Link to="/biens/new"><Plus className="size-4" /> {t("biens.create")}</Link>
        </Button>
      </div>

      {loading ? (
        <div className="card-soft h-32 animate-pulse" />
      ) : biens.length === 0 ? (
        <section className="card-soft p-6 text-center space-y-4">
          <UserRound className="size-10 mx-auto text-primary" />
          <div>
            <h2 className="font-medium">{t("biens.empty")}</h2>
            <p className="text-caption mt-1">{t("biens.emptyHint")}</p>
          </div>
          <Button asChild><Link to="/biens/new">{t("biens.createFirst")}</Link></Button>
        </section>
      ) : (
        <div className="space-y-3">
          {biens.map((bien) => (
            <Link key={bien.id} to={`/biens/${bien.id}`} className="card-soft p-4 block pressable focus-ring">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{bien.title}</p>
                  <p className="text-caption mt-1 flex items-center gap-1">
                    <MapPin className="size-3.5" /> {bien.location_label}
                  </p>
                </div>
                <span className="text-xs rounded-full bg-accent px-2 py-1">{t(`biens.types.${bien.type}`)}</span>
              </div>
              <p className="text-caption mt-3">{t(`biens.contexts.${bien.creation_context}`)}</p>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
