import {describe,expect,it} from "vitest";
import {actionsForRole,canCompleteStep,canRolePerform} from "@/services/intervention-engine";
describe("intervention engine",()=>{
 it("limits an accompanist to non-protected actions",()=>{expect(actionsForRole("accompagnateur")).toContain("accompagne");expect(canRolePerform("accompagnateur","valide")).toBe(false);});
 it("limits a witness to testimony actions",()=>{expect(canRolePerform("temoin","temoigne")).toBe(true);expect(canRolePerform("temoin","enregistre")).toBe(false);});
 it("requires a verified intervention",()=>{expect(canCompleteStep([{action_type:"valide",verification_status:"declare"}],{requiredAction:"valide"})).toBe(false);});
 it("checks action competence and documents",()=>{expect(canCompleteStep([{action_type:"valide",verification_status:"verifie"}],{requiredAction:"valide",requiredCompetence:"notaire",verifiedCompetences:["notaire"],requiredDocuments:["acte"],availableDocuments:["acte"]})).toBe(true);});
 it("rejects a missing competence",()=>{expect(canCompleteStep([{action_type:"valide",verification_status:"verifie"}],{requiredAction:"valide",requiredCompetence:"notaire",verifiedCompetences:[]})).toBe(false);});
});
