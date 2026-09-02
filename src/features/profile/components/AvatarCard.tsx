import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { profilesRepo } from "@/data";
import type { Profile } from "@/core/types/domain";

interface Props {
  userId: string;
  profile: Profile | null;
  onChanged: () => Promise<void> | void;
}

/** Photo de profil : stockage privé, lien temporaire pour l'affichage. */
export function AvatarCard({ userId, profile, onChanged }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!profile?.avatar_url) {
      setUrl(null);
      return;
    }
    profilesRepo
      .getAvatarUrl(profile.avatar_url)
      .then((signed) => {
        if (!cancelled) setUrl(signed);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [profile?.avatar_url]);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      await profilesRepo.uploadAvatar(userId, file);
      await onChanged();
      toast.success(t("profile.avatarSaved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.error"));
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (!profile?.avatar_url) return;
    setBusy(true);
    try {
      await profilesRepo.removeAvatar(userId, profile.avatar_url);
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card-soft p-5 mb-4 flex items-center gap-4">
      <div className="size-16 rounded-2xl bg-accent text-primary overflow-hidden flex items-center justify-center shrink-0">
        {url ? (
          <img src={url} alt={t("profile.avatarAlt")} className="size-full object-cover" loading="lazy" />
        ) : (
          <User className="size-6" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{profile?.full_name || t("profile.noName")}</p>
        <p className="text-caption">{t("profile.avatarHint")}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="tap focus-ring p-2 text-primary"
          aria-label={t("profile.avatarChange")}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
        </button>
        {profile?.avatar_url && (
          <button
            onClick={() => void clear()}
            disabled={busy}
            className="tap focus-ring p-2 text-destructive"
            aria-label={t("common.delete")}
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void pick(event.target.files?.[0])}
      />
    </section>
  );
}
