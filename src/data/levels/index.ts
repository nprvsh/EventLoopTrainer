import type { LevelKey, ThemeKey } from "@/types";
import type { BlockKey } from "@/data/blocks";

export type LevelConfig = {
  /** Блоки, из которых добирается задача после гарантированных. */
  pool: BlockKey[];
  /** Из каждого вложенного списка гарантированно берётся один блок. */
  seed: BlockKey[][];
  /** Минимум и максимум блоков в задаче. */
  count: [number, number];
  /** Задача с большим числом логов отбрасывается и генерируется заново. */
  maxLogs: number;
};

export const LEVELS: Record<LevelKey, LevelConfig> = {
  easy: {
    pool: ["sync", "iife", "timeout0", "timeoutSlow", "timeoutTwo", "micro", "qmt", "microChain"],
    // из каждого списка гарантированно берётся один блок → всегда микс микро + макро
    seed: [
      ["timeout0", "timeoutSlow", "timeoutTwo"],
      ["micro", "qmt", "microChain"],
    ],
    count: [3, 4],
    maxLogs: 6,
  },
  medium: {
    pool: [
      "sync", "timeout0", "micro", "qmt", "microChain", "microChain3", "finallyChain",
      "executor", "macroWithMicro", "asyncFn", "asyncIIFE", "asyncTwoAwaits", "awaitThenTimeout",
      "nestedTimeout", "doubleNestedTimeout", "microWithMacro", "timeoutChainMicro",
      "executorTimeout", "microMacroSandwich",
    ],
    // гарантированно два «злых» блока в каждой задаче
    seed: [
      ["asyncTwoAwaits", "awaitThenTimeout", "executorTimeout", "microMacroSandwich", "timeoutChainMicro", "doubleNestedTimeout", "asyncIIFE", "asyncFn"],
      ["microChain3", "finallyChain", "executor", "macroWithMicro", "nestedTimeout", "microWithMacro", "asyncFn", "timeoutChainMicro"],
    ],
    count: [4, 5],
    maxLogs: 8,
  },
  hard: {
    pool: [
      "megaTimeout", "thenReturnThen", "asyncMega", "qmtNest", "awaitTimeoutCombo",
      "microMacroMicro", "timeoutMicroThenMacro", "executorFull",
      "asyncTwoAwaits", "timeoutChainMicro", "executorTimeout", "doubleNestedTimeout",
      "microMacroSandwich", "microChain3", "sync", "timeout0", "micro",
    ],
    // гарантированно три мега-блока в каждой задаче
    seed: [
      ["megaTimeout", "microMacroMicro", "timeoutMicroThenMacro", "executorFull"],
      ["thenReturnThen", "qmtNest", "executorFull", "microChain3"],
      ["asyncMega", "awaitTimeoutCombo", "asyncTwoAwaits"],
    ],
    count: [4, 5],
    maxLogs: 16,
  },
};

export const THEMES: Record<ThemeKey, { blocks: BlockKey[] | null }> = {
  all: {
    blocks: null,
  },
  microtasks: {
    blocks: ["micro", "qmt", "microChain", "microChain3", "finallyChain", "microWithMacro", "microMacroSandwich", "qmtNest", "thenReturnThen", "microMacroMicro", "timeoutChainMicro", "executorFull"],
  },
  timers: {
    blocks: ["timeout0", "timeoutSlow", "timeoutTwo", "nestedTimeout", "doubleNestedTimeout", "macroWithMicro", "microWithMacro", "awaitThenTimeout", "timeoutChainMicro", "executorTimeout", "microMacroSandwich", "megaTimeout", "microMacroMicro", "timeoutMicroThenMacro", "awaitTimeoutCombo"],
  },
  async: {
    blocks: ["asyncFn", "asyncIIFE", "asyncTwoAwaits", "awaitThenTimeout", "asyncMega", "awaitTimeoutCombo"],
  },
};
