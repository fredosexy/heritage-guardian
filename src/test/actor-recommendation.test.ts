import { describe, expect, it } from "vitest";
import { actorsForEssentialMode, hasUsableCompetence, rankActors, type ActorWithCompetences } from "@/services/actor-recommendation";

const actor = (id: string, overrides: Partial<ActorWithCompetences> = {}): ActorWithCompetences => ({
  id, profile_id: null, actor_type: "professionnel", name: id, description: null, location: "Ngomedzap", territorial_level: "rural",
  verification_status: "non_verifie", availability_status: "disponible", is_published: true, verified_by: null, verified_at: null,
  suspended_at: null, created_at: "2026-01-01", updated_at: "2026-01-01", actor_competences: [], ...overrides,
});
const competence = (status = "declare", expires_at: string | null = null) => ({ id: crypto.randomUUID(), actor_id: "a", competence_code: "notaire", label: "Notaire", status, verified_by: null, verified_at: null, expires_at, created_at: "2026-01-01" });

describe("actor recommendation", () => {
  it("requires the requested competence", () => expect(hasUsableCompetence(actor("a", { actor_competences: [competence()] }), "notaire")).toBe(true));
  it("rejects an expired credential-like competence", () => expect(hasUsableCompetence(actor("a", { actor_competences: [competence("expire")] }), "notaire")).toBe(false));
  it("prioritises verified competence and actor before proximity", () => {
    const nearby = actor("near", { actor_competences: [competence()], location: "Ngomedzap" });
    const verified = actor("verified", { actor_competences: [competence("verifie")], verification_status: "verifie", location: "Yaoundé", territorial_level: "region", verified_by: "v", verified_at: "2026-01-01" });
    expect(rankActors([nearby, verified], { requiredCompetence: "notaire", location: "Ngomedzap", territorialLevel: "rural" })[0].id).toBe("verified");
  });
  it("excludes suspended and unavailable actors", () => expect(rankActors([
    actor("s", { verification_status: "suspendu", suspended_at: "2026-01-01", actor_competences: [competence()] }),
    actor("u", { availability_status: "indisponible", actor_competences: [competence()] }),
  ], { requiredCompetence: "notaire" })).toHaveLength(0));
  it("limits essential mode to three actors", () => expect(actorsForEssentialMode([1,2,3,4].map((n) => actor(String(n))), {})).toHaveLength(3));
});
