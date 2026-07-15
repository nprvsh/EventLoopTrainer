import { describe, expect, it } from "vitest";
import { BLOCKS, LEVELS, THEMES } from "@/data";
import type { BlockContext, CodeBlock } from "@/data";
import type { LevelKey, ThemeKey } from "@/types";
import { buildSnippet, generateTask, runSnippet } from ".";

const makeContext = (): BlockContext => {
  let labelIndex = 0;
  let functionIndex = 0;
  return {
    L: () => String.fromCharCode(65 + labelIndex++),
    F: () => `run${++functionIndex}`,
  };
};

describe("BLOCKS", () => {
  it.each(Object.keys(BLOCKS) as (keyof typeof BLOCKS)[])("%s produces consistent lines and logs", (blockKey) => {
    const block: CodeBlock = BLOCKS[blockKey](makeContext());
    expect(block.lines.length).toBeGreaterThan(0);
    expect(block.logs.length).toBeGreaterThan(0);

    const labels = block.logs.map((log) => log.label);
    expect(new Set(labels).size).toBe(labels.length);

    // каждая метка присутствует в коде блока
    const code = block.lines.join("\n");
    for (const label of labels) {
      expect(code).toContain(`'${label}'`);
    }

    // parent всегда ссылается на уже объявленный лог
    for (const log of block.logs) {
      if (log.parent) expect(labels).toContain(log.parent);
    }
  });

  it("all level pools and seeds reference existing blocks", () => {
    for (const level of Object.values(LEVELS)) {
      for (const key of [...level.pool, ...level.seed.flat()]) {
        expect(BLOCKS[key]).toBeTypeOf("function");
      }
    }
    for (const theme of Object.values(THEMES)) {
      for (const key of theme.blocks ?? []) {
        expect(BLOCKS[key]).toBeTypeOf("function");
      }
    }
  });
});

describe("buildSnippet", () => {
  const levels = Object.keys(LEVELS) as LevelKey[];

  it.each(levels)("%s stays within maxLogs and includes seeded block kinds", (levelKey) => {
    const level = LEVELS[levelKey];
    for (let i = 0; i < 30; i++) {
      const snippet = buildSnippet(levelKey);
      expect(snippet.logs.length).toBeLessThanOrEqual(level.maxLogs);
      expect(snippet.lines.join("\n")).toBe(snippet.code);
    }
  });
});

describe("runSnippet", () => {
  it("captures logs from sync code, microtasks, and timers in engine order", async () => {
    const code = [
      "setTimeout(() => console.log('C'), 0);",
      "Promise.resolve().then(() => console.log('B'));",
      "console.log('A');",
    ].join("\n");
    await expect(runSnippet(code, 3)).resolves.toEqual(["A", "B", "C"]);
  });

  it("returns null when the snippet throws", async () => {
    await expect(runSnippet("throw new Error('boom');", 1)).resolves.toBeNull();
  });

  it("returns null when fewer logs than expected arrive", async () => {
    await expect(runSnippet("console.log('A');", 2)).resolves.toBeNull();
  });
});

describe("generateTask", () => {
  const combos: [LevelKey, ThemeKey][] = [
    ["easy", "all"],
    ["easy", "microtasks"],
    ["easy", "timers"],
    ["medium", "all"],
    ["medium", "async"],
    ["hard", "all"],
  ];

  it.each(combos)("%s / %s produces a task consistent with real execution", async (levelKey, themeKey) => {
    const task = await generateTask(levelKey, themeKey);
    expect(task).not.toBeNull();
    if (!task) return;

    // истина уникальна и согласована с метками логов
    expect(new Set(task.truth).size).toBe(task.truth.length);
    expect([...task.truth].sort()).toEqual(task.logs.map((log) => log.label).sort());

    // tokens — перестановка truth
    expect([...task.tokens].sort()).toEqual([...task.truth].sort());

    // у каждой метки есть фаза
    for (const label of task.truth) {
      expect(task.phaseMap[label]).toBeDefined();
    }

    // код содержит каждую метку
    const code = task.lines.join("\n");
    for (const label of task.truth) {
      expect(code).toContain(`'${label}'`);
    }
  }, 15000);
});
