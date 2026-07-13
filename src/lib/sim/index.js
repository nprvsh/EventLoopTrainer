import { isMicroPhase, isSyncPhase } from "@/data";

// ---------- симуляция для визуализации ----------
// Строит массив «кадров» состояния: стек, очереди, консоль, подпись.
export function buildSim(task) {
  const truthIndexByLabel = {};
  task.truth.forEach((label, index) => (truthIndexByLabel[label] = index));
  const codeLineForLabel = (label) => {
    const index = task.lines.findIndex((line) => line.includes(`'${label}'`) || line.includes(`"${label}"`));
    return index === -1 ? null : index;
  };

  // группы = колбэки: 'with'-дети логируются вместе с родителем
  const callbackGroups = {}; // firstLabel -> { labels: [], phase }
  const groupIdByLabel = {}; // label -> firstLabel
  task.logs.forEach((log) => {
    if (log.parent && log.rel === "with") {
      const groupId = groupIdByLabel[log.parent];
      callbackGroups[groupId].labels.push(log.label);
      groupIdByLabel[log.label] = groupId;
    } else {
      callbackGroups[log.label] = { labels: [log.label], phase: log.phase };
      groupIdByLabel[log.label] = log.label;
    }
  });
  const spawnedLogsByParent = {}; // parentLabel -> [{ label, rel }]
  task.logs.forEach((log) => {
    if (log.parent && (log.rel === "micro" || log.rel === "macro")) {
      (spawnedLogsByParent[log.parent] = spawnedLogsByParent[log.parent] || []).push(log);
    }
  });

  const state = { stack: [], micro: [], macro: [], out: [] };
  const steps = [];
  const captureStep = (note, highlightedZone, label = null, codeLineState = null) =>
    steps.push({
      stack: [...state.stack],
      micro: [...state.micro],
      macro: [...state.macro],
      out: [...state.out],
      note,
      codeLine: label ? codeLineForLabel(label) : null,
      codeLineState,
      hl: highlightedZone || null,
    });

  const formatGroupLabels = (groupId) =>
    callbackGroups[groupId].labels.map((label) => `'${label}'`).join(" ");

  // 1. фаза скрипта
  state.stack = ["script"];
  captureStep("Скрипт выполняется сверху вниз", "stack");
  for (const log of task.logs) {
    if (log.parent) continue;
    if (isSyncPhase(log.phase)) {
      state.out.push(log.label);
      captureStep(
        log.phase === "executor"
          ? `new Promise: executor выполняется синхронно → лог '${log.label}'`
          : `console.log('${log.label}') — синхронно, прямо в стеке`,
        "out",
        log.label,
        "executing"
      );
    } else if (isMicroPhase(log.phase)) {
      state.micro.push(groupIdByLabel[log.label]);
      captureStep(
        log.phase === "awaitAfter"
          ? `await приостанавливает функцию: продолжение '${log.label}' → микрозадачи`
          : `Колбэк ${formatGroupLabels(groupIdByLabel[log.label])} → очередь микрозадач`,
        "micro",
        log.label,
        "queued"
      );
    } else {
      state.macro.push(groupIdByLabel[log.label]);
      captureStep(
        log.phase === "macroSlow"
          ? `setTimeout(…, 100): колбэк '${log.label}' → очередь задач (сработает позже)`
          : `setTimeout регистрирует колбэк ${formatGroupLabels(groupIdByLabel[log.label])} → очередь задач`,
        "macro",
        log.label,
        "queued"
      );
    }
  }
  state.stack = [];
  captureStep("Скрипт закончился — стек вызовов пуст", "stack");

  // выполнение группы-колбэка
  const runGroup = (groupId, note, highlightedZone) => {
    const group = callbackGroups[groupId];
    state.stack = [`callback ${formatGroupLabels(groupId)}`];
    state.out.push(...group.labels);
    captureStep(note, highlightedZone, group.labels[0], "executing");

    for (const label of group.labels) {
      for (const spawnedLog of spawnedLogsByParent[label] || []) {
        if (spawnedLog.rel === "micro") {
          state.micro.push(groupIdByLabel[spawnedLog.label]);
          captureStep(
            spawnedLog.phase === "awaitAfter"
              ? `Следующий await: продолжение '${spawnedLog.label}' → очередь микрозадач`
              : `Изнутри '${label}': колбэк '${spawnedLog.label}' → очередь микрозадач`,
            "micro",
            spawnedLog.label,
            "queued"
          );
        } else {
          state.macro.push(groupIdByLabel[spawnedLog.label]);
          captureStep(
            `Изнутри '${label}': новый setTimeout '${spawnedLog.label}' → очередь задач`,
            "macro",
            spawnedLog.label,
            "queued"
          );
        }
      }
    }
    state.stack = [];
  };

  const takeNextGroup = (queue) => {
    let nextGroupIndex = 0;
    for (let index = 1; index < queue.length; index++) {
      const currentLabel = callbackGroups[queue[index]].labels[0];
      const nextLabel = callbackGroups[queue[nextGroupIndex]].labels[0];
      if (truthIndexByLabel[currentLabel] < truthIndexByLabel[nextLabel]) {
        nextGroupIndex = index;
      }
    }
    return queue.splice(nextGroupIndex, 1)[0];
  };

  // 2. цикл событий
  while (state.micro.length || state.macro.length) {
    while (state.micro.length) {
      const groupId = takeNextGroup(state.micro);
      runGroup(
        groupId,
        `Стек пуст → микрозадача ${formatGroupLabels(groupId)} выполняется: console.log`,
        "out"
      );
    }
    if (state.macro.length) {
      const groupId = takeNextGroup(state.macro);
      runGroup(
        groupId,
        `Микрозадач нет → тик цикла: задача ${formatGroupLabels(groupId)} из очереди`,
        "out"
      );
    }
  }
  captureStep("Очереди пусты — программа отработала ✓", "out");
  return steps;
}
