import type { PhaseId } from "@/types";

export const isMicroPhase = (phase: PhaseId) => phase === "micro" || phase === "awaitAfter" || phase === "microInMacro";
export const isSyncPhase = (phase: PhaseId) => phase === "sync" || phase === "executor";
