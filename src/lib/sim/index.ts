import { isMicroPhase, isSyncPhase } from "@/data";
import type { Strings } from "@/config/strings";
import type { CodeLineState, PhaseId, SimulationStep, Task, TaskLog, VisualizationZone } from "@/types";

type SimStrings = Strings["sim"];

type CallbackGroup = {
  labels: string[];
  phase: PhaseId;
};

// ---------- симуляция для визуализации ----------
// Строит массив «кадров» состояния: стек, очереди, консоль, подпись.
export function buildSim(task: Task, strings: SimStrings): SimulationStep[] {
  const truthIndexByLabel: Record<string, number> = {};
  task.truth.forEach((label, index) => (truthIndexByLabel[label] = index));
  const codeLineForLabel = (label: string): number | null => {
    const index = task.lines.findIndex((line) => line.includes(`'${label}'`) || line.includes(`"${label}"`));
    return index === -1 ? null : index;
  };

  // группы = колбэки: 'with'-дети логируются вместе с родителем
  const callbackGroups: Record<string, CallbackGroup> = {}; // firstLabel -> группа
  const groupIdByLabel: Record<string, string> = {}; // label -> firstLabel
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
  const spawnedLogsByParent: Record<string, TaskLog[]> = {};
  task.logs.forEach((log) => {
    if (log.parent && (log.rel === "micro" || log.rel === "macro")) {
      (spawnedLogsByParent[log.parent] = spawnedLogsByParent[log.parent] || []).push(log);
    }
  });

  const state = { stack: [] as string[], micro: [] as string[], macro: [] as string[], out: [] as string[] };
  const steps: SimulationStep[] = [];
  const captureStep = (
    note: string,
    highlightedZone: VisualizationZone | null,
    label: string | null = null,
    codeLineState: CodeLineState | null = null,
  ) =>
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

  const formatGroupLabels = (groupId: string) =>
    callbackGroups[groupId].labels.map((label) => `'${label}'`).join(" ");

  // 1. фаза скрипта
  state.stack = ["script"];
  captureStep(strings.scriptStart, "stack");
  for (const log of task.logs) {
    if (log.parent) continue;
    if (isSyncPhase(log.phase)) {
      state.out.push(log.label);
      captureStep(
        log.phase === "executor"
          ? strings.executor(log.label)
          : strings.syncLog(log.label),
        "out",
        log.label,
        "executing"
      );
    } else if (isMicroPhase(log.phase)) {
      state.micro.push(groupIdByLabel[log.label]);
      captureStep(
        log.phase === "awaitAfter"
          ? strings.awaitQueued(log.label)
          : strings.microQueued(formatGroupLabels(groupIdByLabel[log.label])),
        "micro",
        log.label,
        "queued"
      );
    } else {
      state.macro.push(groupIdByLabel[log.label]);
      captureStep(
        log.phase === "macroSlow"
          ? strings.slowTimerQueued(log.label)
          : strings.timerQueued(formatGroupLabels(groupIdByLabel[log.label])),
        "macro",
        log.label,
        "queued"
      );
    }
  }
  state.stack = [];
  captureStep(strings.scriptEnd, "stack");

  // выполнение группы-колбэка
  const runGroup = (groupId: string, note: string, highlightedZone: VisualizationZone) => {
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
              ? strings.nextAwaitQueued(spawnedLog.label)
              : strings.nestedMicroQueued(label, spawnedLog.label),
            "micro",
            spawnedLog.label,
            "queued"
          );
        } else {
          state.macro.push(groupIdByLabel[spawnedLog.label]);
          captureStep(
            strings.nestedTimerQueued(label, spawnedLog.label),
            "macro",
            spawnedLog.label,
            "queued"
          );
        }
      }
    }
    state.stack = [];
  };

  // Эталонный порядок известен из реального исполнения (task.truth), поэтому
  // из очереди берётся группа с самым ранним фактическим выводом, а не FIFO:
  // это защищает визуализацию от расхождений с движком.
  const takeNextGroup = (queue: string[]): string => {
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
        strings.microRunning(formatGroupLabels(groupId)),
        "out"
      );
    }
    if (state.macro.length) {
      const groupId = takeNextGroup(state.macro);
      runGroup(
        groupId,
        strings.macroRunning(formatGroupLabels(groupId)),
        "out"
      );
    }
  }
  captureStep(strings.complete, "out");
  return steps;
}
