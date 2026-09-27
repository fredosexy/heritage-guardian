import {useCallback,useEffect,useMemo,useState} from "react";
import {CheckCircle2,History,Loader2,Plus} from "lucide-react";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {actorsRepo,interventionsRepo,participantsRepo,proceduresRepo} from "@/data";
import {useAuth} from "@/features/identity";
import {actionsForRole,type InterventionAction,type InterventionRole} from "@/services/intervention-engine";
import type {DossierIntervention,DossierStep} from "@/core/types/domain";

export function InterventionsSection({dossierId,ownerId}:{dossierId:string;ownerId:string}){
 const {t}=useTranslation(); const {user}=useAuth();
 const [items,setItems]=useState<DossierIntervention[]>([]); const [steps,setSteps]=useState<DossierStep[]>([]);
 const [participantId,setParticipantId]=useState<string|null>(null); const [actorId,setActorId]=useState<string|null>(null);
 const [role,setRole]=useState<InterventionRole>("titulaire"); const [stepId,setStepId]=useState(""); const [action,setAction]=useState<InterventionAction>("declare");
 const [comment,setComment]=useState(""); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
 const load=useCallback(async()=>{if(!user)return;setLoading(true);try{
  const [history,journey,participants,actor]=await Promise.all([interventionsRepo.getInterventionsForDossier(dossierId),proceduresRepo.getDossierSteps(dossierId),participantsRepo.getParticipants(dossierId),actorsRepo.getActorForProfile(user.id)]);
  setItems(history);setSteps(journey);setActorId(actor?.id??null);
  const mine=participants.find(p=>p.person.linked_profile_id===user.id||p.user_id===user.id);
  setParticipantId(mine?.id??null); if(actor){setRole(actor.actor_type==="autorite_locale"?"autorite":actor.actor_type==="service_administratif"?"service":"professionnel");}
  else if(mine)setRole(mine.role as InterventionRole);
  const current=journey.find(s=>["en_cours","a_verifier"].includes(s.status));setStepId(current?.id??journey[0]?.id??"");
 }finally{setLoading(false);}},[dossierId,user]);
 useEffect(()=>{void load();},[load]);
 const allowed=useMemo(()=>actionsForRole(role),[role]);
 useEffect(()=>{if(!allowed.includes(action))setAction(allowed[0]);},[allowed,action]);
 const create=async()=>{if(!stepId||(!actorId&&!participantId))return;setSaving(true);try{
  const step=steps.find(s=>s.id===stepId);await interventionsRepo.createIntervention({dossierId,stepId,actorId,participantId:actorId?null:participantId,role,actionType:action,territorialLevel:step?.territorial_level??"autre",comment});
  setComment("");await load();toast.success(t("interventions.created"));
 }catch(error){toast.error(error instanceof Error?error.message:t("auth.error"));}finally{setSaving(false);}};
 const complete=async()=>{const current=steps.find(s=>["en_cours","a_verifier"].includes(s.status));if(!current)return;try{await interventionsRepo.completeStep(current.id);await load();toast.success(t("interventions.stepCompleted"));}catch{toast.error(t("interventions.conditionsMissing"));}};
 if(loading)return <section className="card-soft p-5 mb-4"><Loader2 className="size-5 animate-spin"/></section>;
 return <section className="card-soft p-5 mb-4 space-y-4">
  <div><h2 className="font-medium flex items-center gap-2"><History className="size-4"/>{t("interventions.title")}</h2><p className="text-caption">{t("interventions.hint")}</p></div>
  {(actorId||participantId)&&steps.length>0&&<div className="rounded-xl border p-3 space-y-3">
   <p className="text-sm font-medium flex items-center gap-2"><Plus className="size-4"/>{t("interventions.add")}</p>
   <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={stepId} onChange={e=>setStepId(e.target.value)}>{steps.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
   <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={action} onChange={e=>setAction(e.target.value as InterventionAction)}>{allowed.map(a=><option key={a} value={a}>{t(`interventions.actions.${a}`)}</option>)}</select>
   <textarea className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={comment} onChange={e=>setComment(e.target.value)} placeholder={t("interventions.comment")}/>
   <Button disabled={saving} onClick={()=>void create()}>{saving&&<Loader2 className="size-4 animate-spin"/>}{t("interventions.confirm")}</Button>
  </div>}
  <div className="space-y-3">{items.length===0?<p className="text-caption">{t("interventions.empty")}</p>:items.map(item=>{const step=steps.find(s=>s.id===item.step_id);return <article key={item.id} className="border-l-2 border-primary/30 pl-3 py-1">
   <p className="text-sm font-medium">{t(`interventions.actions.${item.action_type}`)}</p>
   <p className="text-caption">{step?.title??t("interventions.withoutStep")} · {t(`dossier.roles.${item.role}`)} · {t(`interventions.statuses.${item.verification_status}`)}</p>
   <p className="text-caption">{new Date(item.performed_at).toLocaleDateString()} · {t(`journey.levels.${item.territorial_level}`)}</p>
   {item.comment&&<p className="text-sm mt-1">{item.comment}</p>}{item.supersedes_intervention_id&&<p className="text-caption">{t("interventions.correction")}</p>}
  </article>})}</div>
  {user?.id===ownerId&&steps.some(s=>["en_cours","a_verifier"].includes(s.status))&&<Button variant="outline" className="w-full" onClick={()=>void complete()}><CheckCircle2 className="size-4"/>{t("interventions.completeStep")}</Button>}
 </section>;
}
