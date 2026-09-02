import { useCallback, useEffect, useState } from "react";
import { proofsRepo } from "@/data";
import type { Proof } from "@/core/types/domain";
import { useAuth } from "@/features/identity";

export type MyFile = Proof & { dossier_title?: string | null };

/** Tous les fichiers de l'utilisateur, avec renommage et suppression. */
export function useMyFiles() {
  const { user } = useAuth();
  const [files, setFiles] = useState<MyFile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setFiles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setFiles(await proofsRepo.listUserProofs(user.id));
    } catch {
      /* silencieux : l'écran affiche l'état vide */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const rename = useCallback(async (id: string, title: string) => {
    await proofsRepo.renameProof(id, title);
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, title } : f)));
  }, []);

  const remove = useCallback(async (file: MyFile) => {
    await proofsRepo.deleteProof(file);
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  }, []);

  const preview = useCallback((storagePath: string) => proofsRepo.getProofUrl(storagePath), []);

  return { files, loading, reload: load, rename, remove, preview };
}
