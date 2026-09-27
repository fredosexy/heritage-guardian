import { describe,expect,it } from "vitest";
import { grantState,grantedSubset,hasScope } from "@/services/access-control";
const grant=(expires_at:string|null,revoked_at:string|null,scopes=["voir_resume"])=>({expires_at,revoked_at,access_grant_scopes:scopes.map(scope=>({scope}))});
describe("access control",()=>{
 it("distinguishes active expired and revoked grants",()=>{
  expect(grantState(grant(null,null),100)).toBe("actif");
  expect(grantState(grant("1970-01-01T00:00:00.050Z",null),100)).toBe("expire");
  expect(grantState(grant(null,"2026-01-01"),100)).toBe("revoque");
 });
 it("enforces scope only while active",()=>{expect(hasScope(grant(null,null),"voir_resume",100)).toBe(true);expect(hasScope(grant(null,"x"),"voir_resume",100)).toBe(false);});
 it("allows a reduced but non-empty scope set",()=>{expect(grantedSubset(["voir_resume","commenter"],["voir_resume"])).toBe(true);expect(grantedSubset(["voir_resume"],["intervenir"])).toBe(false);});
});
