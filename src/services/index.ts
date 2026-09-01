export { computeCompletionScore, statusFromScore, scoreDossier } from "./dossier-scoring";
export { fetchDossierSuggestions, streamChat, AiUnavailableError } from "./assistant.service";
export type { ChatMessage } from "./assistant.service";
export { claimLocalData } from "./claim-local-data";
export type { ClaimResult } from "./claim-local-data";
export { computeProfileCompletion } from "./profile-completion";
export type { ProfileCompletion, CompletionStep, ProfileCompletionInput } from "./profile-completion";
