import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/features/shell";
import { Bell, Loader2, Sparkles } from "lucide-react";
import { useAlerts } from "../hooks/useAlerts";

type Filter = "all" | "urgent" | "info" | "suggestion";

export default function AlertsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { alerts, loading, markRead } = useAlerts();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.type === filter);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t("alerts.filterAll") },
    { id: "urgent", label: t("alerts.filterUrgent") },
    { id: "info", label: t("alerts.filterInfo") },
    { id: "suggestion", label: t("alerts.filterAi") },
  ];

  const severityBorder = (severity: string) =>
    severity === "high" ? "border-l-destructive" : severity === "medium" ? "border-l-warning" : "border-l-primary";

  return (
    <AppLayout>
      <h1 className="text-2xl font-serif mb-4">{t("alerts.title")}</h1>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-soft p-8 text-center">
          <Bell className="size-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">{t("alerts.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                void markRead(a.id);
                if (a.action_route) navigate(a.action_route);
              }}
              className={`w-full text-left card-soft border-l-4 ${severityBorder(a.severity)} p-3 ${
                a.read ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  {a.type === "suggestion" && <Sparkles className="size-3.5 text-primary" />}
                  {a.title}
                </p>
                {!a.read && <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground">{a.message}</p>
            </button>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
