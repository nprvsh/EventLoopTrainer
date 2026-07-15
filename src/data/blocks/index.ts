import type { TaskLog } from "@/types";

// ---------- генератор блоков ----------
// Каждый блок получает контекст генерации и возвращает строки кода
// вместе с метаданными логов.
//
// Поле parent связывает запись с логом, во время которого она была создана.
// rel: 'with'  — логируется в том же колбэке, что и parent
//      'micro' — ставится в очередь микрозадач, когда выполняется parent
//      'macro' — ставится в очередь задач, когда выполняется parent

export type BlockContext = {
  /** Следующая метка вывода: A, B, C… */
  L: () => string;
  /** Следующее имя async-функции: run1, run2… */
  F: () => string;
};

export type CodeBlock = {
  lines: string[];
  logs: TaskLog[];
};

export const BLOCKS = {
  sync: (ctx) => {
    const a = ctx.L();
    return { lines: [`console.log('${a}');`], logs: [{ label: a, phase: "sync" }] };
  },
  iife: (ctx) => {
    const a = ctx.L();
    return { lines: [`(() => console.log('${a}'))();`], logs: [{ label: a, phase: "sync" }] };
  },
  timeout0: (ctx) => {
    const a = ctx.L();
    return { lines: [`setTimeout(() => console.log('${a}'), 0);`], logs: [{ label: a, phase: "macro" }] };
  },
  timeoutSlow: (ctx) => {
    const a = ctx.L();
    return { lines: [`setTimeout(() => console.log('${a}'), 100);`], logs: [{ label: a, phase: "macroSlow" }] };
  },
  timeoutTwo: (ctx) => {
    const a = ctx.L(), b = ctx.L();
    return {
      lines: [
        `setTimeout(() => {`,
        `  console.log('${a}');`,
        `  console.log('${b}');`,
        `}, 0);`,
      ],
      logs: [
        { label: a, phase: "macro" },
        { label: b, phase: "macro", parent: a, rel: "with" },
      ],
    };
  },
  micro: (ctx) => {
    const a = ctx.L();
    return { lines: [`Promise.resolve().then(() => console.log('${a}'));`], logs: [{ label: a, phase: "micro" }] };
  },
  microChain: (ctx) => {
    const a = ctx.L(), b = ctx.L();
    return {
      lines: [
        `Promise.resolve()`,
        `  .then(() => console.log('${a}'))`,
        `  .then(() => console.log('${b}'));`,
      ],
      logs: [
        { label: a, phase: "micro" },
        { label: b, phase: "micro", parent: a, rel: "micro" },
      ],
    };
  },
  qmt: (ctx) => {
    const a = ctx.L();
    return { lines: [`queueMicrotask(() => console.log('${a}'));`], logs: [{ label: a, phase: "micro" }] };
  },
  executor: (ctx) => {
    const a = ctx.L(), b = ctx.L();
    return {
      lines: [
        `new Promise((resolve) => {`,
        `  console.log('${a}');`,
        `  resolve();`,
        `}).then(() => console.log('${b}'));`,
      ],
      logs: [
        { label: a, phase: "executor" },
        { label: b, phase: "micro" },
      ],
    };
  },
  macroWithMicro: (ctx) => {
    const a = ctx.L(), b = ctx.L();
    return {
      lines: [
        `setTimeout(() => {`,
        `  console.log('${a}');`,
        `  Promise.resolve().then(() => console.log('${b}'));`,
        `}, 0);`,
      ],
      logs: [
        { label: a, phase: "macro" },
        { label: b, phase: "microInMacro", parent: a, rel: "micro" },
      ],
    };
  },
  asyncFn: (ctx) => {
    const f = ctx.F(), a = ctx.L(), b = ctx.L();
    return {
      lines: [
        `async function ${f}() {`,
        `  console.log('${a}');`,
        `  await Promise.resolve();`,
        `  console.log('${b}');`,
        `}`,
        `${f}();`,
      ],
      logs: [
        { label: a, phase: "sync" },
        { label: b, phase: "awaitAfter" },
      ],
    };
  },
  nestedTimeout: (ctx) => {
    const a = ctx.L(), b = ctx.L();
    return {
      lines: [
        `setTimeout(() => {`,
        `  console.log('${a}');`,
        `  setTimeout(() => console.log('${b}'), 0);`,
        `}, 0);`,
      ],
      logs: [
        { label: a, phase: "macro" },
        { label: b, phase: "macroNested", parent: a, rel: "macro" },
      ],
    };
  },
  microWithMacro: (ctx) => {
    const a = ctx.L(), b = ctx.L();
    return {
      lines: [
        `Promise.resolve().then(() => {`,
        `  console.log('${a}');`,
        `  setTimeout(() => console.log('${b}'), 0);`,
        `});`,
      ],
      logs: [
        { label: a, phase: "micro" },
        { label: b, phase: "macroFromMicro", parent: a, rel: "macro" },
      ],
    };
  },
  microChain3: (ctx) => {
    const a = ctx.L(), b = ctx.L(), c = ctx.L();
    return {
      lines: [
        `Promise.resolve()`,
        `  .then(() => console.log('${a}'))`,
        `  .then(() => console.log('${b}'))`,
        `  .then(() => console.log('${c}'));`,
      ],
      logs: [
        { label: a, phase: "micro" },
        { label: b, phase: "micro", parent: a, rel: "micro" },
        { label: c, phase: "micro", parent: b, rel: "micro" },
      ],
    };
  },
  finallyChain: (ctx) => {
    const a = ctx.L(), b = ctx.L();
    return {
      lines: [
        `Promise.resolve()`,
        `  .then(() => console.log('${a}'))`,
        `  .finally(() => console.log('${b}'));`,
      ],
      logs: [
        { label: a, phase: "micro" },
        { label: b, phase: "micro", parent: a, rel: "micro" },
      ],
    };
  },
  asyncIIFE: (ctx) => {
    const a = ctx.L(), b = ctx.L();
    return {
      lines: [
        `(async () => {`,
        `  console.log('${a}');`,
        `  await null;`,
        `  console.log('${b}');`,
        `})();`,
      ],
      logs: [
        { label: a, phase: "sync" },
        { label: b, phase: "awaitAfter" },
      ],
    };
  },
  asyncTwoAwaits: (ctx) => {
    const f = ctx.F(), a = ctx.L(), b = ctx.L(), c = ctx.L();
    return {
      lines: [
        `async function ${f}() {`,
        `  console.log('${a}');`,
        `  await Promise.resolve();`,
        `  console.log('${b}');`,
        `  await Promise.resolve();`,
        `  console.log('${c}');`,
        `}`,
        `${f}();`,
      ],
      logs: [
        { label: a, phase: "sync" },
        { label: b, phase: "awaitAfter" },
        { label: c, phase: "awaitAfter", parent: b, rel: "micro" },
      ],
    };
  },
  awaitThenTimeout: (ctx) => {
    const f = ctx.F(), a = ctx.L(), b = ctx.L(), c = ctx.L();
    return {
      lines: [
        `async function ${f}() {`,
        `  console.log('${a}');`,
        `  await Promise.resolve();`,
        `  console.log('${b}');`,
        `  setTimeout(() => console.log('${c}'), 0);`,
        `}`,
        `${f}();`,
      ],
      logs: [
        { label: a, phase: "sync" },
        { label: b, phase: "awaitAfter" },
        { label: c, phase: "macroFromMicro", parent: b, rel: "macro" },
      ],
    };
  },
  timeoutChainMicro: (ctx) => {
    const a = ctx.L(), b = ctx.L(), c = ctx.L();
    return {
      lines: [
        `setTimeout(() => {`,
        `  console.log('${a}');`,
        `  Promise.resolve()`,
        `    .then(() => console.log('${b}'))`,
        `    .then(() => console.log('${c}'));`,
        `}, 0);`,
      ],
      logs: [
        { label: a, phase: "macro" },
        { label: b, phase: "microInMacro", parent: a, rel: "micro" },
        { label: c, phase: "microInMacro", parent: b, rel: "micro" },
      ],
    };
  },
  executorTimeout: (ctx) => {
    const a = ctx.L(), b = ctx.L(), c = ctx.L();
    return {
      lines: [
        `new Promise((resolve) => {`,
        `  console.log('${a}');`,
        `  setTimeout(() => {`,
        `    console.log('${b}');`,
        `    resolve();`,
        `  }, 0);`,
        `}).then(() => console.log('${c}'));`,
      ],
      logs: [
        { label: a, phase: "executor" },
        { label: b, phase: "macro" },
        { label: c, phase: "microInMacro", parent: b, rel: "micro" },
      ],
    };
  },
  doubleNestedTimeout: (ctx) => {
    const a = ctx.L(), b = ctx.L(), c = ctx.L();
    return {
      lines: [
        `setTimeout(() => {`,
        `  console.log('${a}');`,
        `  setTimeout(() => {`,
        `    console.log('${b}');`,
        `    setTimeout(() => console.log('${c}'), 0);`,
        `  }, 0);`,
        `}, 0);`,
      ],
      logs: [
        { label: a, phase: "macro" },
        { label: b, phase: "macroNested", parent: a, rel: "macro" },
        { label: c, phase: "macroNested", parent: b, rel: "macro" },
      ],
    };
  },
  microMacroSandwich: (ctx) => {
    const a = ctx.L(), b = ctx.L(), c = ctx.L();
    return {
      lines: [
        `Promise.resolve().then(() => {`,
        `  console.log('${a}');`,
        `  setTimeout(() => {`,
        `    console.log('${b}');`,
        `    Promise.resolve().then(() => console.log('${c}'));`,
        `  }, 0);`,
        `});`,
      ],
      logs: [
        { label: a, phase: "micro" },
        { label: b, phase: "macroFromMicro", parent: a, rel: "macro" },
        { label: c, phase: "microInMacro", parent: b, rel: "micro" },
      ],
    };
  },
  megaTimeout: (ctx) => {
    const a = ctx.L(), b = ctx.L(), c = ctx.L(), d = ctx.L();
    return {
      lines: [
        `setTimeout(() => {`,
        `  console.log('${a}');`,
        `  Promise.resolve().then(() => console.log('${b}'));`,
        `  queueMicrotask(() => console.log('${c}'));`,
        `  console.log('${d}');`,
        `}, 0);`,
      ],
      logs: [
        { label: a, phase: "macro" },
        { label: b, phase: "microInMacro", parent: a, rel: "micro" },
        { label: c, phase: "microInMacro", parent: a, rel: "micro" },
        { label: d, phase: "macro", parent: a, rel: "with" },
      ],
    };
  },
  thenReturnThen: (ctx) => {
    const a = ctx.L(), b = ctx.L(), c = ctx.L(), d = ctx.L();
    return {
      lines: [
        `Promise.resolve()`,
        `  .then(() => {`,
        `    console.log('${a}');`,
        `    queueMicrotask(() => console.log('${b}'));`,
        `    return Promise.resolve().then(() => console.log('${c}'));`,
        `  })`,
        `  .then(() => console.log('${d}'));`,
      ],
      logs: [
        { label: a, phase: "micro" },
        { label: b, phase: "micro", parent: a, rel: "micro" },
        { label: c, phase: "micro", parent: a, rel: "micro" },
        { label: d, phase: "micro", parent: c, rel: "micro" },
      ],
    };
  },
  asyncMega: (ctx) => {
    const a = ctx.L(), b = ctx.L(), c = ctx.L(), d = ctx.L();
    return {
      lines: [
        `(async () => {`,
        `  console.log('${a}');`,
        `  await Promise.resolve();`,
        `  console.log('${b}');`,
        `  Promise.resolve().then(() => console.log('${c}'));`,
        `  await Promise.resolve();`,
        `  console.log('${d}');`,
        `})();`,
      ],
      logs: [
        { label: a, phase: "sync" },
        { label: b, phase: "awaitAfter" },
        { label: c, phase: "micro", parent: b, rel: "micro" },
        { label: d, phase: "awaitAfter", parent: b, rel: "micro" },
      ],
    };
  },
  qmtNest: (ctx) => {
    const a = ctx.L(), b = ctx.L(), c = ctx.L();
    return {
      lines: [
        `queueMicrotask(() => {`,
        `  console.log('${a}');`,
        `  queueMicrotask(() => console.log('${b}'));`,
        `  Promise.resolve().then(() => console.log('${c}'));`,
        `});`,
      ],
      logs: [
        { label: a, phase: "micro" },
        { label: b, phase: "micro", parent: a, rel: "micro" },
        { label: c, phase: "micro", parent: a, rel: "micro" },
      ],
    };
  },
  awaitTimeoutCombo: (ctx) => {
    const f = ctx.F(), a = ctx.L(), b = ctx.L(), c = ctx.L(), d = ctx.L();
    return {
      lines: [
        `async function ${f}() {`,
        `  console.log('${a}');`,
        `  setTimeout(() => console.log('${b}'), 0);`,
        `  await Promise.resolve();`,
        `  console.log('${c}');`,
        `  queueMicrotask(() => console.log('${d}'));`,
        `}`,
        `${f}();`,
      ],
      logs: [
        { label: a, phase: "sync" },
        { label: b, phase: "macro" },
        { label: c, phase: "awaitAfter" },
        { label: d, phase: "micro", parent: c, rel: "micro" },
      ],
    };
  },
  microMacroMicro: (ctx) => {
    const a = ctx.L(), b = ctx.L(), c = ctx.L(), d = ctx.L(), e = ctx.L();
    return {
      lines: [
        `Promise.resolve().then(() => {`,
        `  console.log('${a}');`,
        `  setTimeout(() => {`,
        `    console.log('${b}');`,
        `    queueMicrotask(() => console.log('${c}'));`,
        `    Promise.resolve().then(() => console.log('${d}'));`,
        `  }, 0);`,
        `  console.log('${e}');`,
        `});`,
      ],
      logs: [
        { label: a, phase: "micro" },
        { label: b, phase: "macroFromMicro", parent: a, rel: "macro" },
        { label: c, phase: "microInMacro", parent: b, rel: "micro" },
        { label: d, phase: "microInMacro", parent: b, rel: "micro" },
        { label: e, phase: "micro", parent: a, rel: "with" },
      ],
    };
  },
  timeoutMicroThenMacro: (ctx) => {
    const a = ctx.L(), b = ctx.L(), c = ctx.L();
    return {
      lines: [
        `setTimeout(() => {`,
        `  console.log('${a}');`,
        `  Promise.resolve().then(() => {`,
        `    console.log('${b}');`,
        `    setTimeout(() => console.log('${c}'), 0);`,
        `  });`,
        `}, 0);`,
      ],
      logs: [
        { label: a, phase: "macro" },
        { label: b, phase: "microInMacro", parent: a, rel: "micro" },
        { label: c, phase: "macroNested", parent: b, rel: "macro" },
      ],
    };
  },
  executorFull: (ctx) => {
    const a = ctx.L(), b = ctx.L(), c = ctx.L(), d = ctx.L();
    return {
      lines: [
        `new Promise((resolve) => {`,
        `  console.log('${a}');`,
        `  queueMicrotask(() => console.log('${b}'));`,
        `  resolve();`,
        `}).then(() => {`,
        `  console.log('${c}');`,
        `  queueMicrotask(() => console.log('${d}'));`,
        `});`,
      ],
      logs: [
        { label: a, phase: "executor" },
        { label: b, phase: "micro" },
        { label: c, phase: "micro" },
        { label: d, phase: "micro", parent: c, rel: "micro" },
      ],
    };
  },
} satisfies Record<string, (ctx: BlockContext) => CodeBlock>;

export type BlockKey = keyof typeof BLOCKS;
