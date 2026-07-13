import { BLOCKS, LEVELS } from "@/data";
import { rnd, pick, shuffle } from "@/lib/random";

export function buildSnippet(levelKey) {
  const lvl = LEVELS[levelKey];

  for (let tries = 0; tries < 60; tries++) {
    const count = lvl.count[0] + rnd(lvl.count[1] - lvl.count[0] + 1);

    // по одному гарантированному блоку из каждого seed-пула
    const chosen = lvl.seed.map((s) => pick(s));
    while (chosen.length < count) {
      const b = pick(lvl.pool);
      if (chosen.filter((x) => x === b).length < 2) chosen.push(b);
    }
    const order = shuffle(chosen);

    let li = 0, fi = 0;
    const ctx = {
      L: () => String.fromCharCode(65 + li++),
      F: () => `run${++fi}`,
    };

    const lines = [];
    const logs = [];
    order.forEach((key, i) => {
      const b = BLOCKS[key](ctx);
      lines.push(...b.lines);
      logs.push(...b.logs);
      if (i < order.length - 1) lines.push("");
    });

    if (logs.length <= lvl.maxLogs) return { code: lines.join("\n"), lines, logs };
  }
  // fallback: минимальный вариант
  return buildMinimal(lvl);
}

function buildMinimal(lvl) {
  let li = 0, fi = 0;
  const ctx = { L: () => String.fromCharCode(65 + li++), F: () => `run${++fi}` };
  const lines = [], logs = [];
  lvl.seed.forEach((s, i) => {
    const b = BLOCKS[pick(s)](ctx);
    lines.push(...b.lines);
    logs.push(...b.logs);
    if (i < lvl.seed.length - 1) lines.push("");
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
    } catch (e) {
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
 * @returns {Promise<import("@/types").Task | null>}
 */
export async function generateTask(levelKey) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const s = buildSnippet(levelKey);
    const truth = await runSnippet(s.code, s.logs.length);
    if (truth && new Set(truth).size === truth.length) {
      /** @type {Record<string, import("@/types").PhaseId>} */
      const phaseMap = {};
      s.logs.forEach((l) => (phaseMap[l.label] = l.phase));
      return { lines: s.lines, truth, phaseMap, logs: s.logs, tokens: shuffle(truth) };
    }
  }
  return null;
}
