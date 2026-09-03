import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, FolderOpen, Paperclip, Plus, Sparkles, User, UserPlus } from "lucide-react";
import type { NextActionIcon } from "@/services";
import { useNextAction } from "../hooks/useNextAction";

const icons: Record<NextActionIcon, typeof Plus> = {
  create: Plus,
  proof: Paperclip,
  account: UserPlus,
  alert: Bell,
  assistant: Sparkles,
  dossiers: FolderOpen,
  profile: User,
};

/** « Et maintenant ? » — une action suivante unique et évidente sur chaque écran. */
export function NextActionCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const action = useNextAction();
  const Icon = icons[action.icon];

  return (
    <button
      onClick={() => navigate(action.route)}
      className={`w-full card-soft p-4 flex items-center gap-3 text-left pressable focus-ring tap ${className ?? ""}`}
    >
      <span className="size-10 rounded-xl bg-gradient-warm text-primary-foreground flex items-center justify-center shrink-0">
        <Icon className="size-4" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-caption">{t("next.title")}</span>
        <span className="block text-sm font-medium">{t(action.labelKey)}</span>
        <span className="block text-caption">{t(action.hintKey)}</span>
      </span>
      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
    </button>
  );
}
