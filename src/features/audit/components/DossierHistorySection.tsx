import { useEffect, useMemo, useState } from "react";
import { Clock3, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getAuditEventsForDossier, type AuditEvent } from "@/data/audit.repo";
import { auditEventKey, filterAuditEvents, groupAuditEventsByDay, type AuditAudience } from "@/services/audit-timeline";

export function DossierHistorySection({ dossierId }: { dossierId: string }) {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [audience, setAudience] = useState<AuditAudience>("essential");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    getAuditEventsForDossier(dossierId)
      .then((items) => { if (active) setEvents(items); })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [dossierId]);

  const groups = useMemo(
    () => groupAuditEventsByDay(filterAuditEvents(events, audience)),
    [events, audience],
  );
  const locale = i18n.language.startsWith("fr") ? "fr-CM" : "en";

  return (
    <section className="card-soft p-5 mb-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium flex items-center gap-2">
          <Clock3 className="size-4" />{t("audit.title")}
        </h2>
        <div className="flex gap-2" aria-label={t("audit.detailLevel")}>
          <Button size="sm" variant={audience === "essential" ? "default" : "outline"} onClick={() => setAudience("essential")}>{t("audit.essential")}</Button>
          <Button size="sm" variant={audience === "complete" ? "default" : "outline"} onClick={() => setAudience("complete")}>{t("audit.complete")}</Button>
        </div>
      </div>
      {loading && <div className="flex justify-center py-4"><Loader2 className="size-4 animate-spin" /></div>}
      {failed && <p className="text-caption">{t("audit.loadError")}</p>}
      {!loading && !failed && Object.keys(groups).length === 0 && <p className="text-caption">{t("audit.empty")}</p>}
      {Object.entries(groups).map(([day, items]) => (
        <div key={day} className="space-y-2">
          <p className="text-caption font-medium">{new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(day))}</p>
          <ol className="border-l pl-4 space-y-3">
            {items.map((event) => {
              const source = String((event.safe_context as Record<string, unknown>).source ?? "BACKEND").toLowerCase();
              return <li key={event.id} className="relative">
                <span className="absolute -left-[1.28rem] top-1.5 size-2 rounded-full bg-primary" />
                <p className="text-sm font-medium">{t(auditEventKey(event.action))}</p>
                <p className="text-caption">{new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(new Date(event.occurred_at))} · {t(`audit.sources.${source}`, source)}</p>
              </li>;
            })}
          </ol>
        </div>
      ))}
    </section>
  );
}
