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

export type TaskLog = {
  label: string;
  phase: PhaseId;
  parent?: string;
  rel?: LogRelation;
}

export type BlockContext = {
  L: () => string;
  F: () => string;
}

export type BlockResult = {
  lines: string[];
  logs: TaskLog[];
}

export type BlockFactory = (context: BlockContext) => BlockResult;
export type BlockKey = string;

export type LevelConfig = {
  title: string;
  desc: string;
  pool: BlockKey[];
  seed: BlockKey[][];
  count: [number, number];
  maxLogs: number;
}

export type LevelKey = "easy" | "medium" | "hard";

export type ThemeKey = "all" | "microtasks" | "timers" | "async";

export type ColorThemeKey = "midnight" | "ocean" | "forest" | "rose";
export type LocaleKey = "ru" | "en";

export type Snippet = {
  code: string;
  lines: string[];
  logs: TaskLog[];
}

export type Task = {
  lines: string[];
  truth: string[];
  phaseMap: Record<string, PhaseId>;
  logs: TaskLog[];
  tokens: string[];
}

export type Stats = {
  streak: number;
  best: number;
  solved: number;
  total: number;
}

export type VisualizationZone = "stack" | "micro" | "macro" | "out";
export type CodeLineState = "queued" | "executing";

export type SimulationStep = {
  stack: string[];
  micro: string[];
  macro: string[];
  out: string[];
  note: string;
  codeLine: number | null;
  codeLineState: CodeLineState | null;
  hl: VisualizationZone | null;
}
