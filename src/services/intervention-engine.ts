import type { TerritorialLevel } from "@/core/types/domain";

export const INTERVENTION_ACTIONS = ["declare","accompagne","constate","temoigne","signe","verifie","valide","enregistre","transmis","recu","corrige"] as const;
export type InterventionAction = typeof INTERVENTION_ACTIONS[number];
export type InterventionRole = "titulaire"|"ayant_droit"|"declarant"|"accompagnateur"|"temoin"|"professionnel"|"service"|"autorite";
export type InterventionVerification = "declare"|"a_verifier"|"verifie"|"conteste"|"invalide";

const roleActions: Record<InterventionRole, readonly InterventionAction[]> = {
 titulaire:["declare","constate","signe","transmis","recu","corrige"],
 ayant_droit:["declare","constate","signe","transmis","recu","corrige"],
 declarant:["declare","transmis","recu","corrige"],
 accompagnateur:["accompagne","declare","transmis","recu","corrige"],
 temoin:["temoigne","constate","signe","corrige"],
 professionnel:INTERVENTION_ACTIONS,
 service:INTERVENTION_ACTIONS,
 autorite:INTERVENTION_ACTIONS,
};
export interface InterventionLike { action_type:string; verification_status:string; actor_id?:string|null }
export interface StepCompletionContext {
 requiredAction?:string|null; requiredCompetence?:string|null; verifiedCompetences?:string[];
 requiredDocuments?:string[]; availableDocuments?:string[];
}
export function actionsForRole(role:InterventionRole){return roleActions[role];}
export function canRolePerform(role:InterventionRole,action:InterventionAction){return roleActions[role].includes(action);}
export function canCompleteStep(interventions:InterventionLike[],context:StepCompletionContext){
 const verified=interventions.filter(item=>item.verification_status==="verifie");
 if(context.requiredAction&&!verified.some(item=>item.action_type===context.requiredAction)) return false;
 if(!context.requiredAction&&verified.length===0) return false;
 if(context.requiredCompetence&&!(context.verifiedCompetences??[]).includes(context.requiredCompetence)) return false;
 return (context.requiredDocuments??[]).every(id=>(context.availableDocuments??[]).includes(id));
}
export interface InterventionDraft { role:InterventionRole;actionType:InterventionAction;territorialLevel:TerritorialLevel;comment?:string; }
