// Фазы event loop, к которым относится каждый лог, и подсказки для разбора.
export const PHASES = {
  sync: { name: "синхронно", hint: "выполняется сразу, стек вызовов" },
  macro: { name: "макрозадача", hint: "setTimeout попадает в очередь таймеров" },
  macroSlow: { name: "макрозадача (задержка)", hint: "таймер с большей задержкой сработает позже" },
  micro: { name: "микрозадача", hint: "очередь микрозадач опустошается до таймеров" },
  awaitAfter: { name: "микрозадача (после await)", hint: "код после await — это .then()" },
  microInMacro: { name: "микрозадача внутри таймера", hint: "микрозадачи выполняются сразу после колбэка таймера" },
  macroNested: { name: "вложенный setTimeout", hint: "новый таймер встаёт в конец очереди" },
  macroFromMicro: { name: "setTimeout из микрозадачи", hint: "таймер регистрируется позже синхронных" },
  executor: { name: "синхронно (executor)", hint: "функция внутри new Promise выполняется сразу" },
};

export const isMicroPhase = (p) => p === "micro" || p === "awaitAfter" || p === "microInMacro";
export const isSyncPhase = (p) => p === "sync" || p === "executor";
