import { BLOCKS, LEVELS, THEMES } from "@/data";
import type { BlockContext, BlockKey } from "@/data";
import { rnd, pick, shuffle } from "@/lib/random";
import type { LevelKey, Task, TaskLog, ThemeKey } from "@/types";

/** Сколько раз перегенерировать набор блоков, пока не уложимся в maxLogs уровня. */
const SNIPPET_ATTEMPTS = 60;
/** Сколько сниппетов исполнить, пока не получится задача с уникальными метками. */
const TASK_ATTEMPTS = 5;
/** Максимум повторов одного блока в задаче. */
const MAX_BLOCK_REPEATS = 2;
/** Сниппет, не выдавший все логи за это время, считается неудачным. */
const RUN_TIMEOUT_MS = 900;
const RUN_POLL_INTERVAL_MS = 25;

export type Snippet = {
  code: string;
  lines: string[];
  logs: TaskLog[];
};

const assembleBlocks = (blockKeys: BlockKey[]): Snippet => {
  let logLabelIndex = 0;
  let functionIndex = 0;
  const context: BlockContext = {
    L: () => String.fromCharCode(65 + logLabelIndex++),
    F: () => `run${++functionIndex}`,
  };

  const lines: string[] = [];
  const logs: TaskLog[] = [];
  blockKeys.forEach((blockKey, index) => {
    const block = BLOCKS[blockKey](context);
    lines.push(...block.lines);
    logs.push(...block.logs);
    if (index < blockKeys.length - 1) lines.push("");
  });

  return { code: lines.join("\n"), lines, logs };
};

export function buildSnippet(levelKey: LevelKey, themeKey: ThemeKey = "all"): Snippet {
  const level = LEVELS[levelKey];
  const theme = THEMES[themeKey];
  const themeBlocks = theme.blocks;
  const pool = themeBlocks ? level.pool.filter((key) => themeBlocks.includes(key)) : level.pool;
  const seedPools = themeBlocks
    ? level.seed.map((seedPool) => seedPool.filter((key) => themeBlocks.includes(key))).filter((seedPool) => seedPool.length)
    : level.seed;

  for (let attempt = 0; attempt < SNIPPET_ATTEMPTS; attempt++) {
    const count = level.count[0] + rnd(level.count[1] - level.count[0] + 1);

    // по одному гарантированному блоку из каждого seed-пула
    const selectedBlockKeys = seedPools.map((seedPool) => pick(seedPool));
    while (selectedBlockKeys.length < count) {
      const blockKey = pick(pool);
      if (selectedBlockKeys.filter((key) => key === blockKey).length < MAX_BLOCK_REPEATS) {
        selectedBlockKeys.push(blockKey);
      }
    }

    const snippet = assembleBlocks(shuffle(selectedBlockKeys));
    if (snippet.logs.length <= level.maxLogs) return snippet;
  }

  // fallback: минимальный вариант — только гарантированные блоки
  return assembleBlocks(seedPools.map((seedPool) => pick(seedPool)));
}

// Реальное исполнение сниппета с перехваченным console.log.
// new Function здесь безопасен: исполняется только код, собранный самим
// приложением из статических блоков, пользовательский ввод в него не попадает.
export function runSnippet(code: string, expected: number): Promise<string[] | null> {
  return new Promise((resolve) => {
    const out: string[] = [];
    const fakeConsole = { log: (value: unknown) => out.push(String(value)) };
    try {
      new Function("console", code)(fakeConsole);
    } catch {
      resolve(null);
      return;
    }
    // Логи из таймеров приходят асинхронно (в том числе setTimeout(…, 100)),
    // поэтому ждём их поллингом до таймаута.
    const start = Date.now();
    const poll = setInterval(() => {
      if (out.length >= expected || Date.now() - start > RUN_TIMEOUT_MS) {
        clearInterval(poll);
        resolve(out.length === expected ? out : null);
      }
    }, RUN_POLL_INTERVAL_MS);
  });
}

export async function generateTask(levelKey: LevelKey, themeKey: ThemeKey = "all"): Promise<Task | null> {
  for (let attempt = 0; attempt < TASK_ATTEMPTS; attempt++) {
    const snippet = buildSnippet(levelKey, themeKey);
    const truth = await runSnippet(snippet.code, snippet.logs.length);
    if (truth && new Set(truth).size === truth.length) {
      const phaseMap: Task["phaseMap"] = {};
      snippet.logs.forEach((log) => (phaseMap[log.label] = log.phase));
      return { lines: snippet.lines, truth, phaseMap, logs: snippet.logs, tokens: shuffle(truth) };
    }
  }
  return null;
}
