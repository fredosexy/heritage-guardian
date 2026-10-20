import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, CloudOff, RefreshCw, X } from "lucide-react";
import { AppLayout, PageHeader } from "@/features/shell";
import { Button } from "@/components/ui/button";
import type { SyncConflict } from "@/data/offline/db";
import type { EditableField } from "@/services/sync-conflicts";
import { useSyncCenter } from "../hooks/useSyncCenter";

function ConflictCard({ c, onResolve }: { c: SyncConflict; onResolve: (choice: Partial<Record<EditableField, "mine" | "theirs">>) => Promise<void> }) {
  const { t } = useTranslation();
  const [choice, setChoice] = useState<Partial<Record<EditableField, "mine" | "theirs">>>({});
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try { await onResolve(choice); toast.success(t("sync.resolved")); }
    catch { toast.error(t("sync.error")); }
    finally { setBusy(false); }
  };
  return (
    <div className="card-soft p-4 space-y-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">{c.title}</p>
          <p className="text-caption">{t("sync.conflictHint")}</p>
        </div>
      </div>
      {c.fields.map((f) => {
        const field = f as EditableField;
        const picked = choice[field] ?? "mine";
        return (
          <div key={f} className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{t(`sync.field_${f}`)}</p>
            <div className="grid grid-cols-2 gap-2">
              {(["mine", "theirs"] as const).map((side) => (
                <button key={side} onClick={() => setChoice({ ...choice, [field]: side })}
                  className={`rounded-xl border p-2 text-left text-sm transition ${picked === side ? "border-primary bg-accent" : "border-border"}`}>
                  <span className="block text-xs text-muted-foreground">{t(`sync.${side}`)}</span>
                  <span className="break-words">{(side === "mine" ? c.mine[f] : c.theirs[f]) || t("sync.empty")}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <Button className="w-full" disabled={busy} onClick={submit}>{t("sync.apply")}</Button>
    </div>
  );
}

export default function SyncCenterPage() {
  const { t } = useTranslation();
  const { queue, conflicts, retry, discard, resolve } = useSyncCenter();

  return (
    <AppLayout>
      <PageHeader title={t("sync.title")} subtitle={t("sync.subtitle")} />

      {conflicts.length > 0 && (
        <section className="mb-6 space-y-3">
          <h2 className="text-sm font-semibold">{t("sync.conflicts")} ({conflicts.length})</h2>
          {conflicts.map((c) => (
            <ConflictCard key={c.id} c={c} onResolve={(ch) => resolve(c.id!, c.mine, c.theirs, ch)} />
          ))}
        </section>
      )}

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t("sync.pending")} ({queue.length})</h2>
          {queue.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => retry()}>
              <RefreshCw className="size-3" /> {t("sync.retry")}
            </Button>
          )}
        </div>
        {queue.length === 0 && conflicts.length === 0 ? (
          <div className="card-soft p-4 flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-primary" /> {t("sync.none")}
          </div>
        ) : (
          queue.map((op) => (
            <div key={op.id} className="card-soft p-3 flex items-center gap-3">
              <CloudOff className="size-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{t(`sync.kind_${op.kind}`)}</p>
                <p className="text-caption truncate">
                  {new Date(op.created_at).toLocaleString()}
                  {op.attempts > 0 && ` · ${t("sync.attempts", { count: op.attempts })}`}
                </p>
                {op.last_error && <p className="text-xs text-destructive truncate">{t("sync.error")}</p>}
              </div>
              <Button size="icon" variant="ghost" aria-label={t("sync.discard")} onClick={() => discard(op.id!)}>
                <X className="size-4" />
              </Button>
            </div>
          ))
        )}
      </section>
    </AppLayout>
  );
}
