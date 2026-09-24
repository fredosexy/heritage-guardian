import { describe, expect, it, vi } from "vitest";
import { computeAlertCandidates } from "@/services/alert-rules";
import type { Dossier } from "@/core/types/domain";

const dossier = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Terrain familial",
  status: "risk",
  updated_at: "2026-01-01T00:00:00.000Z",
} as Dossier;

describe("alert rules", () => {
  it("creates stable actionable alerts without duplicates in one evaluation", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-24T00:00:00.000Z"));
    const alerts = computeAlertCandidates({
      dossiers: [dossier],
      proofCountByDossier: {},
      participantCountByDossier: {},
      profileIncomplete: false,
    });
    expect(alerts.map((alert) => alert.dedupe_key)).toEqual([
      `no-proof:${dossier.id}`,
      `no-heir:${dossier.id}`,
      `at-risk:${dossier.id}`,
    ]);
    expect(new Set(alerts.map((alert) => alert.dedupe_key)).size).toBe(alerts.length);
    vi.useRealTimers();
  });

  it("suggests creating a dossier when none exists", () => {
    const alerts = computeAlertCandidates({
      dossiers: [],
      proofCountByDossier: {},
      participantCountByDossier: {},
      profileIncomplete: false,
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].dedupe_key).toBe("no-dossier");
  });
});
