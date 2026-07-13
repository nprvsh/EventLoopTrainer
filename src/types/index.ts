export type PhaseId =
  | "sync"
  | "macro"
  | "macroSlow"
  | "micro"
  | "awaitAfter"
  | "microInMacro"
  | "macroNested"
  | "macroFromMicro"
  | "executor";

export type LogRelation = "with" | "micro" | "macro";

export interface TaskLog {
  label: string;
  phase: PhaseId;
  parent?: string;
  rel?: LogRelation;
}

export interface BlockContext {
  L: () => string;
  F: () => string;
}

export interface BlockResult {
  lines: string[];
  logs: TaskLog[];
}

export type BlockFactory = (context: BlockContext) => BlockResult;
export type BlockKey = string;

export interface LevelConfig {
  title: string;
  desc: string;
  pool: BlockKey[];
  seed: BlockKey[][];
  count: [number, number];
  maxLogs: number;
}

export type LevelKey = "easy" | "hard" | "insane";

export interface Snippet {
  code: string;
  lines: string[];
  logs: TaskLog[];
}

export interface Task {
  lines: string[];
  truth: string[];
  phaseMap: Record<string, PhaseId>;
  logs: TaskLog[];
  tokens: string[];
}

export interface Stats {
  streak: number;
  best: number;
  solved: number;
  total: number;
}

export type VisualizationZone = "stack" | "micro" | "macro" | "out";

export interface SimulationStep {
  stack: string[];
  micro: string[];
  macro: string[];
  out: string[];
  note: string;
  hl: VisualizationZone | null;
}
