export const isMicroPhase = (p) => p === "micro" || p === "awaitAfter" || p === "microInMacro";
export const isSyncPhase = (p) => p === "sync" || p === "executor";
