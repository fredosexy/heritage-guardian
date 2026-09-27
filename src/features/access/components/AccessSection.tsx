import { useCallback,useEffect,useState } from "react";
import { KeyRound,Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { accessRepo,proofsRepo } from "@/data";
import type { Document } from "@/core/types/domain";
import { ACCESS_SCOPES,type AccessScope } from "@/services/access-control";
import { useAuth } from "@/features/identity";

type RequestRow=Awaited<ReturnType<typeof accessRepo.getAccessRequestsForDossier>>[number];
type GrantRow=Awaited<ReturnType<typeof accessRepo.getActiveGrants>>[number];

export function AccessSection({dossierId,ownerId}:{dossierId:string;ownerId:string}){
 const {t}=useTranslation(); const {user}=useAuth(); const owner=user?.id===ownerId;
 const [requests,setRequests]=useState<RequestRow[]>([]); const [grants,setGrants]=useState<GrantRow[]>([]);
 const [documents,setDocuments]=useState<Document[]>([]); const [selected,setSelected]=useState<Record<string,string[]>>({});
 const [loading,setLoading]=useState(true); const [purpose,setPurpose]=useState(""); const [scopes,setScopes]=useState<AccessScope[]>(["voir_resume"]);
 const load=useCallback(async()=>{setLoading(true);try{const [r,g,d]=await Promise.all([accessRepo.getAccessRequestsForDossier(dossierId),accessRepo.getActiveGrants(dossierId),owner?proofsRepo.getDocumentsForDossier(dossierId):Promise.resolve([])]);setRequests(r);setGrants(g);setDocuments(d);}finally{setLoading(false);}},[dossierId,owner]);
 useEffect(()=>{void load();},[load]);
 const decide=async(request:RequestRow,decision:"acceptee"|"refusee")=>{try{const requested=request.access_request_scopes.map(item=>item.scope as AccessScope);const docs=selected[request.id]??[];const granted=requested.filter(scope=>scope!=="voir_documents_selectionnes"||docs.length>0);await accessRepo.resolveAccessRequest(request.id,decision,decision==="acceptee"?granted:[],decision==="acceptee"?docs:[]);await load();toast.success(t(`access.${decision}`));}catch(error){toast.error(error instanceof Error?error.message:t("auth.error"));}};
 const request=async()=>{if(!purpose.trim())return;await accessRepo.requestAccess({dossierId,purpose,scopes});setPurpose("");await load();toast.success(t("access.requested"));};
 if(loading)return <section className="card-soft p-5 mb-4"><Loader2 className="size-5 animate-spin"/></section>;
 return <section className="card-soft p-5 mb-4 space-y-4"><div><h2 className="font-medium flex items-center gap-2"><KeyRound className="size-4"/>{t("access.title")}</h2><p className="text-caption">{t("access.hint")}</p></div>
 {owner?<>
  <div className="space-y-3"><h3 className="text-sm font-medium">{t("access.pending")}</h3>{requests.filter(r=>r.status==="en_attente").length===0?<p className="text-caption">{t("access.noPending")}</p>:requests.filter(r=>r.status==="en_attente").map(r=><div key={r.id} className="rounded-lg border p-3 space-y-2"><p className="text-sm">{r.purpose}</p><ul className="text-caption list-disc pl-5">{r.access_request_scopes.map(s=><li key={s.scope}>{t(`access.scopes.${s.scope}`)}</li>)}</ul>{r.access_request_scopes.some(s=>s.scope==="voir_documents_selectionnes")&&<div className="space-y-1">{documents.map(d=><label key={d.id} className="flex gap-2 text-xs"><input type="checkbox" checked={(selected[r.id]??[]).includes(d.id)} onChange={e=>setSelected(prev=>({...prev,[r.id]:e.target.checked?[...(prev[r.id]??[]),d.id]:(prev[r.id]??[]).filter(id=>id!==d.id)}))}/>{d.title}</label>)}</div>}<div className="flex gap-2"><Button size="sm" onClick={()=>void decide(r,"acceptee")}>{t("access.accept")}</Button><Button size="sm" variant="outline" onClick={()=>void decide(r,"refusee")}>{t("access.refuse")}</Button></div></div>)}</div>
  <div className="space-y-2"><h3 className="text-sm font-medium">{t("access.active")}</h3>{grants.length===0?<p className="text-caption">{t("access.noActive")}</p>:grants.map(g=><div key={g.id} className="rounded-lg border p-3"><p className="text-sm">{g.purpose}</p><p className="text-caption">{g.access_grant_scopes.map(s=>t(`access.scopes.${s.scope}`)).join(" · ")}</p><Button className="mt-2" size="sm" variant="destructive" onClick={async()=>{await accessRepo.revokeAccess(g.id);await load();}}>{t("access.revoke")}</Button></div>)}</div>
 </>:<div className="space-y-3"><input className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder={t("access.purpose")}/><div className="space-y-1">{ACCESS_SCOPES.map(scope=><label key={scope} className="flex gap-2 text-sm"><input type="checkbox" checked={scopes.includes(scope)} onChange={e=>setScopes(e.target.checked?[...scopes,scope]:scopes.filter(s=>s!==scope))}/>{t(`access.scopes.${scope}`)}</label>)}</div><Button disabled={!purpose.trim()||scopes.length===0} onClick={()=>void request()}>{t("access.request")}</Button>{requests.map(r=><p key={r.id} className="text-caption">{r.purpose} · {t(`access.statuses.${r.status}`)}</p>)}</div>}
 </section>;
}
