export const LEVELS = {
  easy: {
    title: "Easy",
    desc: "синхронный код, таймеры и простые микрозадачи вперемешку",
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
    title: "Medium",
    desc: "async/await, вложенность, цепочки и ловушки",
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
    title: "Hard",
    desc: "монструозные задачи со злых собеседований: много логов, всё вперемешку",
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

export const THEMES = {
  all: {
    title: "Все темы",
    blocks: null,
  },
  microtasks: {
    title: "Микрозадачи",
    blocks: ["micro", "qmt", "microChain", "microChain3", "finallyChain", "microWithMacro", "microMacroSandwich", "qmtNest", "thenReturnThen", "microMacroMicro", "timeoutChainMicro", "executorFull"],
  },
  timers: {
    title: "Таймеры",
    blocks: ["timeout0", "timeoutSlow", "timeoutTwo", "nestedTimeout", "doubleNestedTimeout", "macroWithMicro", "microWithMacro", "awaitThenTimeout", "timeoutChainMicro", "executorTimeout", "microMacroSandwich", "megaTimeout", "microMacroMicro", "timeoutMicroThenMacro", "awaitTimeoutCombo"],
  },
  async: {
    title: "async / await",
    blocks: ["asyncFn", "asyncIIFE", "asyncTwoAwaits", "awaitThenTimeout", "asyncMega", "awaitTimeoutCombo"],
  },
};
