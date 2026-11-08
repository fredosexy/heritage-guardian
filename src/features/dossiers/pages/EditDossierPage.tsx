import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, CloudOff } from "lucide-react";
import { AppLayout, EmptyState, PageHeader } from "@/features/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEditDossier } from "../hooks/useEditDossier";
import { AgriculturalFamilyFields } from "./AgriculturalFamilyFields";
import { useDossiers } from "../hooks/useDossiers";

type Family = "exploitation" | "plantation" | "elevage" | "equipement" | "infrastructure" | "autre";
const FAMILIES: Family[] = ["exploitation", "plantation", "elevage", "equipement", "infrastructure", "autre"];

export default function EditDossierPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { dossier, loading, save, saveAgricultural, canEdit } = useEditDossier(id);
  const { dossiers: availableDossiers } = useDossiers();
  const [form, setForm] = useState({ title: "", description: "", location_name: "" });
  const [family, setFamily] = useState<Family>("exploitation");
  const [specifics, setSpecifics] = useState("");
  const [familyDetails, setFamilyDetails] = useState<Record<string, string>>({});
  const [declaredPeople, setDeclaredPeople] = useState<Array<{ id: string; name: string; role: string; note: string; source: "declarant"; status: "declare"; recordedAt: string }>>([]);
  const [events, setEvents] = useState<Array<{ id: string; type: string; date: string; description: string; source: "declarant"; recordedAt: string }>>([]);
  const [relatedAssets, setRelatedAssets] = useState<Array<{ dossierId: string; relationType: string }>>([]);
  const [personDraft, setPersonDraft] = useState({ name: "", role: "owner_declared", note: "" });
  const [eventDraft, setEventDraft] = useState({ type: "inventory", date: new Date().toISOString().slice(0, 10), description: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!dossier) return;
    setForm({ title: dossier.title, description: dossier.description ?? "", location_name: dossier.location_name ?? "" });
    if (dossier.type === "agricole") {
      const metadata = dossier.metadata && typeof dossier.metadata === "object" && !Array.isArray(dossier.metadata)
        ? dossier.metadata as Record<string, unknown>
        : {};
      const raw = metadata.agriculturalRural;
      const asset = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
      setFamily(FAMILIES.includes(asset.family as Family) ? asset.family as Family : "autre");
      setSpecifics(typeof asset.declaredDetails === "string" ? asset.declaredDetails : "");
      const details = asset.familyDetails && typeof asset.familyDetails === "object" && !Array.isArray(asset.familyDetails)
        ? asset.familyDetails as Record<string, unknown>
        : {};
      setFamilyDetails(Object.fromEntries(Object.entries(details).map(([key, value]) => [key, String(value)])));
      setDeclaredPeople(Array.isArray(asset.declaredPeople) ? asset.declaredPeople as typeof declaredPeople : []);
      setEvents(Array.isArray(asset.events) ? asset.events as typeof events : []);
      setRelatedAssets(Array.isArray(asset.relatedAssets) ? asset.relatedAssets as typeof relatedAssets : []);
    }
  }, [dossier]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const numericKeys = ["declaredArea", "declaredQuantity"];
    for (const key of numericKeys) {
      const raw = familyDetails[key]?.trim();
      if (raw && (!Number.isFinite(Number(raw)) || Number(raw) < 0)) {
        toast.error(t("agricultural.invalidNumber"));
        return;
      }
    }
    setBusy(true);
    try {
      const mainChanged = await save(form);
      let agriculturalChanged = false;
      if (dossier?.type === "agricole") {
        const familyDetailsNormalized = Object.fromEntries(
          Object.entries(familyDetails)
            .filter(([, value]) => value.trim() !== "")
            .map(([key, value]) => [key, numericKeys.includes(key) ? Number(value) : value])
        );
        agriculturalChanged = await saveAgricultural({
          family,
          declaredDetails: specifics.trim() || null,
          familyDetails: familyDetailsNormalized,
          declaredPeople,
          events,
          relatedAssets,
        });
      }
      if (!mainChanged && !agriculturalChanged) {
        toast.info(t("sync.noChange"));
        return;
      }
      toast.success(t("sync.savedOffline"), { action: { label: t("sync.open"), onClick: () => navigate("/sync") } });
      navigate(`/dossiers/${id}`, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("sync.error"));
    } finally {
      setBusy(false);
    }
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
      {!canEdit && <p className="mb-4 text-sm text-muted-foreground">{t("sync.ownerOnly")}</p>}
      <form onSubmit={(event) => void submit(event)} className="card-soft space-y-4 p-4">
        <fieldset disabled={!canEdit || busy} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">{t("sync.field_title")}</Label>
            <Input id="title" required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="desc">{t("sync.field_description")}</Label>
            <Textarea id="desc" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="loc">{t("sync.field_location_name")}</Label>
            <Input id="loc" value={form.location_name} onChange={(event) => setForm({ ...form, location_name: event.target.value })} />
          </div>
          {dossier.type === "agricole" && (
            <section className="space-y-4 border-t border-border pt-4">
              <div>
                <h2 className="text-base font-semibold">{t("agricultural.structuredTitle")}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{t("agricultural.declarationNotice")}</p>
              </div>
              <div>
                <Label htmlFor="agricultural-edit-family">{t("agricultural.family")}</Label>
                <select id="agricultural-edit-family" value={family} onChange={(event) => { setFamily(event.target.value as Family); setFamilyDetails({}); }} className="mt-1.5 min-h-12 w-full rounded-2xl border border-input bg-background px-3 text-sm">
                  {FAMILIES.map((value) => <option key={value} value={value}>{t("agricultural.families." + value)}</option>)}
                </select>
              </div>
              <AgriculturalFamilyFields family={family} value={familyDetails} onChange={setFamilyDetails} />
              <div className="space-y-1">
                <Label htmlFor="agricultural-edit-specifics">{t("agricultural.specificsLabel")}</Label>
                <Textarea id="agricultural-edit-specifics" rows={3} value={specifics} onChange={(event) => setSpecifics(event.target.value)} />
              </div>
              <section className="space-y-3 rounded-2xl border border-border p-4">
                <div>
                  <h3 className="text-sm font-semibold">{t("agricultural.people.title")}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{t("agricultural.people.disclaimer")}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="agricultural-person-name">{t("agricultural.people.name")}</Label>
                    <Input id="agricultural-person-name" value={personDraft.name} onChange={(event) => setPersonDraft({ ...personDraft, name: event.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="agricultural-person-role">{t("agricultural.people.role")}</Label>
                    <select id="agricultural-person-role" value={personDraft.role} onChange={(event) => setPersonDraft({ ...personDraft, role: event.target.value })} className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                      {["owner_declared","coowner_declared","holder_declared","beneficiary_declared","representative_declared","operator_declared","manager_declared","occupant_declared"].map((role) => <option key={role} value={role}>{t("agricultural.people.roles." + role)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="agricultural-person-note">{t("agricultural.people.note")}</Label>
                    <Input id="agricultural-person-note" value={personDraft.note} onChange={(event) => setPersonDraft({ ...personDraft, note: event.target.value })} />
                  </div>
                </div>
                <Button type="button" variant="outline" disabled={!personDraft.name.trim()} onClick={() => {
                  setDeclaredPeople((current) => [...current, { id: "person-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7), ...personDraft, name: personDraft.name.trim(), source: "declarant", status: "declare", recordedAt: new Date().toISOString() }]);
                  setPersonDraft({ name: "", role: "owner_declared", note: "" });
                }}>{t("agricultural.people.add")}</Button>
                {declaredPeople.length > 0 ? <ul className="space-y-2">{declaredPeople.map((person) => <li key={person.id} className="flex items-start justify-between gap-2 rounded-xl bg-muted/40 p-3"><div className="min-w-0"><p className="text-sm font-medium">{person.name}</p><p className="text-xs text-muted-foreground">{t("agricultural.people.roles." + person.role)} · {t("agricultural.people.declared")}</p>{person.note ? <p className="mt-1 text-xs">{person.note}</p> : null}</div><Button type="button" size="sm" variant="ghost" onClick={() => setDeclaredPeople((current) => current.filter((item) => item.id !== person.id))}>{t("common.delete")}</Button></li>)}</ul> : <p className="text-xs text-muted-foreground">{t("agricultural.people.empty")}</p>}
              </section>
              <section className="space-y-3 rounded-2xl border border-border p-4">
                <div>
                  <h3 className="text-sm font-semibold">{t("agricultural.links.title")}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{t("agricultural.links.disclaimer")}</p>
                </div>
                {availableDossiers.filter((item) => item.id !== dossier.id && ["terrain", "batiment", "agricole"].includes(item.type) && !item.local).length > 0 ? (
                  <div className="space-y-2">
                    {availableDossiers.filter((item) => item.id !== dossier.id && ["terrain", "batiment", "agricole"].includes(item.type) && !item.local).map((item) => {
                      const current = relatedAssets.find((link) => link.dossierId === item.id);
                      return <div key={item.id} className="grid gap-2 rounded-xl bg-muted/40 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                        <label className="flex min-w-0 items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(current)} onChange={(event) => setRelatedAssets((links) => event.target.checked ? [...links, { dossierId: item.id, relationType: "associated_asset" }] : links.filter((link) => link.dossierId !== item.id))} /><span className="min-w-0"><span className="block truncate font-medium">{item.title}</span><span className="text-xs text-muted-foreground">{t("dossier.typeLabel")}: {item.type}</span></span></label>
                        {current ? <select aria-label={t("agricultural.links.relationTo", { title: item.title })} value={current.relationType} onChange={(event) => setRelatedAssets((links) => links.map((link) => link.dossierId === item.id ? { ...link, relationType: event.target.value } : link))} className="min-h-10 rounded-xl border border-input bg-background px-2 text-xs">
                          {["grouped_under","located_on","installed_on","associated_asset"].map((relation) => <option key={relation} value={relation}>{t("agricultural.links.types." + relation)}</option>)}
                        </select> : null}
                      </div>;
                    })}
                  </div>
                ) : <p className="text-xs text-muted-foreground">{t("agricultural.links.empty")}</p>}
              </section>
              <section className="space-y-3 rounded-2xl border border-border p-4">
                <div>
                  <h3 className="text-sm font-semibold">{t("agricultural.events.title")}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{t("agricultural.events.disclaimer")}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="agricultural-event-type">{t("agricultural.events.type")}</Label>
                    <select id="agricultural-event-type" value={eventDraft.type} onChange={(event) => setEventDraft({ ...eventDraft, type: event.target.value })} className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                      {["acquisition","sale","creation","change","inventory","damage","transmission","correction"].map((type) => <option key={type} value={type}>{t("agricultural.events.types." + type)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="agricultural-event-date">{t("agricultural.events.date")}</Label>
                    <Input id="agricultural-event-date" type="date" value={eventDraft.date} onChange={(event) => setEventDraft({ ...eventDraft, date: event.target.value })} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="agricultural-event-description">{t("agricultural.events.description")}</Label>
                    <Textarea id="agricultural-event-description" rows={2} value={eventDraft.description} onChange={(event) => setEventDraft({ ...eventDraft, description: event.target.value })} />
                  </div>
                </div>
                <Button type="button" variant="outline" disabled={!eventDraft.description.trim() || !eventDraft.date} onClick={() => {
                  setEvents((current) => [...current, { id: "event-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7), ...eventDraft, description: eventDraft.description.trim(), source: "declarant", recordedAt: new Date().toISOString() }]);
                  setEventDraft({ type: "inventory", date: new Date().toISOString().slice(0, 10), description: "" });
                }}>{t("agricultural.events.add")}</Button>
                {events.length > 0 ? <ol className="space-y-2">{[...events].sort((a, b) => b.date.localeCompare(a.date)).map((event) => <li key={event.id} className="flex items-start justify-between gap-2 rounded-xl bg-muted/40 p-3"><div className="min-w-0"><p className="text-sm font-medium">{t("agricultural.events.types." + event.type)} · {event.date}</p><p className="mt-1 text-xs">{event.description}</p><p className="mt-1 text-[11px] text-muted-foreground">{t("agricultural.events.declared")}</p></div><Button type="button" size="sm" variant="ghost" onClick={() => setEvents((current) => current.filter((item) => item.id !== event.id))}>{t("common.delete")}</Button></li>)}</ol> : <p className="text-xs text-muted-foreground">{t("agricultural.events.empty")}</p>}
              </section>
            </section>
          )}
          <Button type="submit" className="w-full" disabled={busy || !form.title.trim()}>
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}{t("sync.save")}
          </Button>
        </fieldset>
      </form>
    </AppLayout>
  );
}
