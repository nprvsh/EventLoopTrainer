import { isMicroPhase, isSyncPhase } from "../data/phases.js";

// ---------- симуляция для визуализации ----------
// Строит массив «кадров» состояния: стек, очереди, консоль, подпись.
export function buildSim(task) {
  const truthIdx = {};
  task.truth.forEach((l, i) => (truthIdx[l] = i));

  // группы = колбэки: 'with'-дети логируются вместе с родителем
  const groups = {};        // firstLabel -> { labels: [], phase }
  const groupOf = {};       // label -> firstLabel
  task.logs.forEach((l) => {
    if (l.parent && l.rel === "with") {
      const g = groupOf[l.parent];
      groups[g].labels.push(l.label);
      groupOf[l.label] = g;
    } else {
      groups[l.label] = { labels: [l.label], phase: l.phase };
      groupOf[l.label] = l.label;
    }
  });
  const spawns = {};        // parentLabel -> [{label, rel}]
  task.logs.forEach((l) => {
    if (l.parent && (l.rel === "micro" || l.rel === "macro")) {
      (spawns[l.parent] = spawns[l.parent] || []).push(l);
    }
  });

  const st = { stack: [], micro: [], macro: [], out: [] };
  const steps = [];
  const snap = (note, hl) =>
    steps.push({
      stack: [...st.stack], micro: [...st.micro], macro: [...st.macro], out: [...st.out],
      note, hl: hl || null,
    });

  const gLabel = (gid) => groups[gid].labels.map((x) => `'${x}'`).join(" ");

  // 1. фаза скрипта
  st.stack = ["script"];
  snap("Скрипт выполняется сверху вниз", "stack");
  for (const l of task.logs) {
    if (l.parent) continue;
    if (isSyncPhase(l.phase)) {
      st.out.push(l.label);
      snap(
        l.phase === "executor"
          ? `new Promise: executor выполняется синхронно → лог '${l.label}'`
          : `console.log('${l.label}') — синхронно, прямо в стеке`,
        "out"
      );
    } else if (isMicroPhase(l.phase)) {
      st.micro.push(groupOf[l.label]);
      snap(
        l.phase === "awaitAfter"
          ? `await приостанавливает функцию: продолжение '${l.label}' → микрозадачи`
          : `Колбэк ${gLabel(groupOf[l.label])} → очередь микрозадач`,
        "micro"
      );
    } else {
      st.macro.push(groupOf[l.label]);
      snap(
        l.phase === "macroSlow"
          ? `setTimeout(…, 100): колбэк '${l.label}' → очередь задач (сработает позже)`
          : `setTimeout регистрирует колбэк ${gLabel(groupOf[l.label])} → очередь задач`,
        "macro"
      );
    }
  }
  st.stack = [];
  snap("Скрипт закончился — стек вызовов пуст", "stack");

  // выполнение группы-колбэка
  const runGroup = (gid, note, hl) => {
    const g = groups[gid];
    st.stack = [`callback ${gLabel(gid)}`];
    st.out.push(...g.labels);
    snap(note, hl);
    for (const lbl of g.labels) {
      for (const ch of spawns[lbl] || []) {
        if (ch.rel === "micro") {
          st.micro.push(groupOf[ch.label]);
          snap(
            ch.phase === "awaitAfter"
              ? `Следующий await: продолжение '${ch.label}' → очередь микрозадач`
              : `Изнутри '${lbl}': колбэк '${ch.label}' → очередь микрозадач`,
            "micro"
          );
        } else {
          st.macro.push(groupOf[ch.label]);
          snap(`Изнутри '${lbl}': новый setTimeout '${ch.label}' → очередь задач`, "macro");
        }
      }
    }
    st.stack = [];
  };

  const popMin = (q) => {
    let best = 0;
    for (let i = 1; i < q.length; i++) {
      if (truthIdx[groups[q[i]].labels[0]] < truthIdx[groups[q[best]].labels[0]]) best = i;
    }
    return q.splice(best, 1)[0];
  };

  // 2. цикл событий
  while (st.micro.length || st.macro.length) {
    while (st.micro.length) {
      const gid = popMin(st.micro);
      runGroup(gid, `Стек пуст → микрозадача ${gLabel(gid)} выполняется: console.log`, "out");
    }
    if (st.macro.length) {
      const gid = popMin(st.macro);
      runGroup(gid, `Микрозадач нет → тик цикла: задача ${gLabel(gid)} из очереди`, "out");
    }
  }
  snap("Очереди пусты — программа отработала ✓", "out");
  return steps;
}
