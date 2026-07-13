import { BLOCKS, LEVELS, THEMES } from "@/data";
import { rnd, pick, shuffle } from "@/lib/random";

export function buildSnippet(levelKey, themeKey = "all") {
  const level = LEVELS[levelKey];
  const theme = THEMES[themeKey];
  const pool = theme.blocks ? level.pool.filter((key) => theme.blocks.includes(key)) : level.pool;
  const seedPools = theme.blocks
    ? level.seed.map((seedPool) => seedPool.filter((key) => theme.blocks.includes(key))).filter((seedPool) => seedPool.length)
    : level.seed;

  for (let attempt = 0; attempt < 60; attempt++) {
    const count = level.count[0] + rnd(level.count[1] - level.count[0] + 1);

    // по одному гарантированному блоку из каждого seed-пула
    const selectedBlockKeys = seedPools.map((seedPool) => pick(seedPool));
    while (selectedBlockKeys.length < count) {
      const blockKey = pick(pool);
      if (selectedBlockKeys.filter((key) => key === blockKey).length < 2) {
        selectedBlockKeys.push(blockKey);
      }
    }
    const blockOrder = shuffle(selectedBlockKeys);

    let logLabelIndex = 0;
    let functionIndex = 0;
    const blockContext = {
      L: () => String.fromCharCode(65 + logLabelIndex++),
      F: () => `run${++functionIndex}`,
    };

    const lines = [];
    const logs = [];
    blockOrder.forEach((blockKey, index) => {
      const block = BLOCKS[blockKey](blockContext);
      lines.push(...block.lines);
      logs.push(...block.logs);
      if (index < blockOrder.length - 1) lines.push("");
    });

    if (logs.length <= level.maxLogs) return { code: lines.join("\n"), lines, logs };
  }
  // fallback: минимальный вариант
  return buildMinimal(seedPools);
}

function buildMinimal(seedPools) {
  let logLabelIndex = 0;
  let functionIndex = 0;
  const blockContext = {
    L: () => String.fromCharCode(65 + logLabelIndex++),
    F: () => `run${++functionIndex}`,
  };
  const lines = [];
  const logs = [];

  seedPools.forEach((seedPool, index) => {
    const block = BLOCKS[pick(seedPool)](blockContext);
    lines.push(...block.lines);
    logs.push(...block.logs);
    if (index < seedPools.length - 1) lines.push("");
  });

  return { code: lines.join("\n"), lines, logs };
}

// Реальное исполнение сниппета с перехватом console.log
export function runSnippet(code, expected) {
  return new Promise((resolve) => {
    const out = [];
    const fakeConsole = { log: (v) => out.push(String(v)) };
    try {
      new Function("console", code)(fakeConsole);
    } catch {
      resolve(null);
      return;
    }
    const start = Date.now();
    const iv = setInterval(() => {
      if (out.length >= expected || Date.now() - start > 900) {
        clearInterval(iv);
        resolve(out.length === expected ? out : null);
      }
    }, 25);
  });
}

/**
 * @param {import("@/types").LevelKey} levelKey
 * @param {import("@/types").ThemeKey} themeKey
 * @returns {Promise<import("@/types").Task | null>}
 */
export async function generateTask(levelKey, themeKey = "all") {
  for (let attempt = 0; attempt < 5; attempt++) {
    const snippet = buildSnippet(levelKey, themeKey);
    const truth = await runSnippet(snippet.code, snippet.logs.length);
    if (truth && new Set(truth).size === truth.length) {
      /** @type {Record<string, import("@/types").PhaseId>} */
      const phaseMap = {};
      snippet.logs.forEach((log) => (phaseMap[log.label] = log.phase));
      return { lines: snippet.lines, truth, phaseMap, logs: snippet.logs, tokens: shuffle(truth) };
    }
  }
  return null;
}
