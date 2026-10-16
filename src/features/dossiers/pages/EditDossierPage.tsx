import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AppLayout, EmptyState, PageHeader } from "@/features/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CloudOff } from "lucide-react";
import { useEditDossier } from "../hooks/useEditDossier";

export default function EditDossierPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { dossier, loading, save } = useEditDossier(id);
  const [form, setForm] = useState({ title: "", description: "", location_name: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (dossier) setForm({ title: dossier.title, description: dossier.description ?? "", location_name: dossier.location_name ?? "" });
  }, [dossier]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      const changed = await save(form);
      if (!changed) { toast.info(t("sync.noChange")); return; }
      toast.success(t("sync.savedOffline"), { action: { label: t("sync.open"), onClick: () => navigate("/sync") } });
      navigate(`/dossiers/${id}`, { replace: true });
    } finally { setBusy(false); }
  };

  if (loading) return <AppLayout><div className="flex justify-center py-12"><Loader2 className="size-5 animate-spin text-primary" /></div></AppLayout>;
  if (!dossier) return (
    <AppLayout>
      <PageHeader title={t("sync.editTitle")} showBack />
      <EmptyState icon={CloudOff} title={t("sync.unavailable")} actionLabel={t("dossiers.title")} onAction={() => navigate("/dossiers")} />
    </AppLayout>
  );

  return (
    <AppLayout>
      <PageHeader title={t("sync.editTitle")} showBack />
      <form onSubmit={submit} className="card-soft p-4 space-y-4">
        <div className="space-y-1">
          <Label htmlFor="title">{t("sync.field_title")}</Label>
          <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="desc">{t("sync.field_description")}</Label>
          <Textarea id="desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="loc">{t("sync.field_location_name")}</Label>
          <Input id="loc" value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>{t("sync.save")}</Button>
      </form>
    </AppLayout>
  );
}
