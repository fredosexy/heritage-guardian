import { BadgeCheck, MapPin, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ActorWithCompetences } from "@/services/actor-recommendation";

export function ActorCard({ actor }: { actor: ActorWithCompetences }) {
  const { t } = useTranslation();
  const verified = actor.verification_status === "verifie";
  return <article className="card-soft p-4 space-y-3">
    <div className="flex items-start justify-between gap-3"><div><h3 className="font-medium">{actor.name}</h3><p className="text-caption">{t(`actors.types.${actor.actor_type}`)}</p></div>
      <span className={`flex items-center gap-1 text-xs ${verified ? "text-success" : "text-muted-foreground"}`}>{verified ? <BadgeCheck className="size-4" /> : <ShieldAlert className="size-4" />}{t(`actors.verification.${actor.verification_status}`)}</span></div>
    {actor.description && <p className="text-sm">{actor.description}</p>}
    <div className="flex items-center gap-1 text-caption"><MapPin className="size-4" />{actor.location} · {t(`journey.levels.${actor.territorial_level}`)}</div>
    <div className="flex flex-wrap gap-2">{actor.actor_competences.map((item) => <span key={item.id} className="rounded-full bg-muted px-2 py-1 text-xs">{item.label} · {t(`actors.competenceStatus.${item.status}`)}</span>)}</div>
  </article>;
}
