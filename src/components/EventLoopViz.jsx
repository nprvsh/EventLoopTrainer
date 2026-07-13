import { useState, useEffect, useMemo } from "react";
import { buildSim } from "../lib/sim.js";
import s from "./EventLoopViz.module.css";

// ---------- визуализация event loop ----------
function VizZone({ title, tone, active, children, stack = false, row = false }) {
  return (
    <div className={[
      s.zone, tone,
      stack ? s.zoneStack : s.zoneQueue,
      active ? s.zoneActive : "",
    ].join(" ")}>
      <div className={s.zoneTitle}>{title}</div>
      <div className={`${s.zoneBody} ${row ? s.zoneBodyRow : ""}`}>
        {children}
      </div>
    </div>
  );
}

function VizChip({ children, tone, wide }) {
  return (
    <span className={[s.chip, tone, wide ? s.chipWide : ""].join(" ")}>
      {children}
    </span>
  );
}

export default function EventLoopViz({ task }) {
  const steps = useMemo(() => buildSim(task), [task]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => { setI(0); setPlaying(true); }, [steps]);

  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setI((x) => x + 1), 1700);
    return () => clearTimeout(t);
  }, [playing, i, steps]);

  const step = steps[i];

  return (
    <div className={s.viz}>
      {/* подпись шага + управление */}
      <div className={s.controls}>
        <button className={s.ctrl} onClick={() => { setPlaying(false); setI((x) => Math.max(0, x - 1)); }}>‹</button>
        <button
          className={`${s.ctrl} ${s.ctrlPlay}`}
          onClick={() => {
            if (i >= steps.length - 1) { setI(0); setPlaying(true); }
            else setPlaying((p) => !p);
          }}
        >
          {playing ? "❚❚" : i >= steps.length - 1 ? "↻" : "▶"}
        </button>
        <button className={s.ctrl} onClick={() => { setPlaying(false); setI((x) => Math.min(steps.length - 1, x + 1)); }}>›</button>
        <span className={s.counter}>{i + 1}/{steps.length}</span>
        <span key={i} className={s.note}>{step.note}</span>
      </div>

      {/* прогресс */}
      <div className={s.progress}>
        <div className={s.progressFill} style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
      </div>

      {/* схема */}
      <div className={s.zones}>
        <VizZone title="Call Stack" tone={s.toneAmber} active={step.hl === "stack"} stack>
          {step.stack.length
            ? step.stack.map((f) => <VizChip key={f} tone={s.toneAmber} wide>{f}</VizChip>)
            : <span className={s.empty}>пусто</span>}
        </VizZone>
        <div className={s.queues}>
          <VizZone title="Microtask Queue" tone={s.toneKw} active={step.hl === "micro"} row>
            {step.micro.length
              ? step.micro.map((g) => <VizChip key={g} tone={s.toneKw}>{g}</VizChip>)
              : <span className={s.empty}>—</span>}
          </VizZone>
          <VizZone title="Task Queue (setTimeout)" tone={s.toneNum} active={step.hl === "macro"} row>
            {step.macro.length
              ? step.macro.map((g) => <VizChip key={g} tone={s.toneNum}>{g}</VizChip>)
              : <span className={s.empty}>—</span>}
          </VizZone>
        </div>
      </div>

      {/* консоль */}
      <div className={`${s.console} ${step.hl === "out" ? s.consoleActive : ""}`}>
        <span className={s.consoleLabel}>CONSOLE</span>
        {step.out.map((l) => (
          <span key={l} className={s.outChip}>'{l}'</span>
        ))}
        {!step.out.length && <span className={s.empty}>вывода пока нет</span>}
      </div>
    </div>
  );
}
