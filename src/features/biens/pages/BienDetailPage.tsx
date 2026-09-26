import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, ShieldAlert, UserRound } from "lucide-react";
import { AppLayout } from "@/features/shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/identity";
import { biensRepo } from "@/data";
import type { Bien } from "@/core/types/domain";
import type { BienRightHolderWithPerson } from "@/data/biens.repo";

export default function BienDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bien, setBien] = useState<Bien | null>(null);
  const [holders, setHolders] = useState<BienRightHolderWithPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    Promise.all([biensRepo.getBienById(id), biensRepo.getRightHolders(id)])
      .then(([asset, relations]) => {
        if (active) {
          setBien(asset);
          setHolders(relations);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <AppLayout><div className="card-soft h-48 animate-pulse" /></AppLayout>;
  if (!bien) return <AppLayout><p>{t("biens.notFound")}</p></AppLayout>;

  const createdByCurrentUser = bien.created_by === user?.id;

  return (
    <AppLayout>
      <div className="mb-6">
        <p className="text-caption">{t(`biens.types.${bien.type}`)}</p>
        <h1 className="text-display mt-1">{bien.title}</h1>
        <p className="text-caption mt-2 flex items-center gap-1"><MapPin className="size-4" /> {bien.location_label}</p>
      </div>

      <section className="card-soft p-5 mb-4 space-y-3">
        <h2 className="font-medium">{t("biens.responsibility")}</h2>
        <p className="text-sm">{createdByCurrentUser ? t("biens.createdByYou") : t("biens.createdWithHelp")}</p>
        <p className="text-caption">{t(`biens.contexts.${bien.creation_context}`)}</p>
      </section>

      <section className="card-soft p-5 mb-4 space-y-3">
        <h2 className="font-medium flex items-center gap-2"><UserRound className="size-4" /> {t("biens.declaredHolders")}</h2>
        {holders.map((holder) => (
          <div key={holder.id} className="rounded-xl border p-3">
            <p className="text-sm font-medium">{holder.person.display_name}</p>
            <p className="text-caption">{t(`biens.roles.${holder.role}`)} · {t(`biens.statuses.${holder.status}`)}</p>
          </div>
        ))}
        <div className="flex gap-2 text-caption"><ShieldAlert className="size-4 shrink-0" /><p>{t("biens.legalNotice")}</p></div>
      </section>

      {bien.description && <section className="card-soft p-5 mb-4"><h2 className="font-medium mb-2">{t("biens.description")}</h2><p className="text-sm whitespace-pre-wrap">{bien.description}</p></section>}
      {bien.origin_declared && <section className="card-soft p-5 mb-4"><h2 className="font-medium mb-2">{t("biens.origin")}</h2><p className="text-sm whitespace-pre-wrap">{bien.origin_declared}</p></section>}

      <Button asChild variant="outline" className="w-full"><Link to="/biens">{t("biens.back")}</Link></Button>
    </AppLayout>
  );
}
