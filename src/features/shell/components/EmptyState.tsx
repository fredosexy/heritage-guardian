import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  icon: LucideIcon;
  /** Ce qui se passe, en langage humain. */
  title: string;
  /** Pourquoi c'est vide et ce que ça change. */
  description?: string;
  actionLabel: string;
  onAction: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/** État vide qui explique et propose toujours une action. Aucun cul-de-sac. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: Props) {
  return (
    <div className="card-soft p-8 text-center">
      <span className="size-12 rounded-2xl bg-accent text-primary mx-auto mb-4 flex items-center justify-center">
        <Icon className="size-5" />
      </span>
      <p className="font-medium mb-1">{title}</p>
      {description && <p className="text-caption mb-4">{description}</p>}
      <Button onClick={onAction} className="bg-gradient-warm w-full">
        {actionLabel}
      </Button>
      {secondaryLabel && onSecondary && (
        <button onClick={onSecondary} className="mt-3 text-sm text-primary tap focus-ring">
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
