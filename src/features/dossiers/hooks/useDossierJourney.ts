import { useCallback, useEffect, useMemo, useState } from "react";
import { proceduresRepo } from "@/data";
import type { DossierStep } from "@/core/types/domain";
import { getJourneySummary } from "@/services/journey-engine";

export function useDossierJourney(dossierId?: string) {
  const [steps, setSteps] = useState<DossierStep[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!dossierId) { setSteps([]); setLoading(false); return; }
    setLoading(true);
    try { setSteps(await proceduresRepo.getDossierSteps(dossierId)); } finally { setLoading(false); }
  }, [dossierId]);
  useEffect(() => { void load(); }, [load]);
  const summary = useMemo(() => getJourneySummary(steps), [steps]);
  const initialize = useCallback(async () => { if (dossierId) { await proceduresRepo.initializeDossierJourney(dossierId); await load(); } }, [dossierId, load]);
  const completeCurrent = useCallback(async () => { if (summary.currentStep?.status === "en_cours") { await proceduresRepo.completeStep(summary.currentStep.id); await load(); } }, [summary.currentStep, load]);
  return { steps, summary, loading, initialize, completeCurrent, reload: load };
}
