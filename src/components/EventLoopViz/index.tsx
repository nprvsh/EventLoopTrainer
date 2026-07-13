import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";
import { buildSim } from "@/lib";
import type { SimulationStep, Task } from "@/types";
import s from "./EventLoopViz.module.css";

interface EventLoopVizProps {
  task: Task;
}

interface VizZoneProps extends PropsWithChildren {
  title: string;
  tone: string;
  active: boolean;
  stack?: boolean;
  row?: boolean;
}

interface VizChipProps extends PropsWithChildren {
  tone: string;
  wide?: boolean;
}

function VizZone({ title, tone, active, children, stack = false, row = false }: VizZoneProps) {
  return <div className={[s.zone, tone, stack ? s.zoneStack : s.zoneQueue, active ? s.zoneActive : ""].join(" ")}><div className={s.zoneTitle}>{title}</div><div className={`${s.zoneBody} ${row ? s.zoneBodyRow : ""}`}>{children}</div></div>;
}

function VizChip({ children, tone, wide = false }: VizChipProps) {
  return <span className={[s.chip, tone, wide ? s.chipWide : ""].join(" ")}>{children}</span>;
}

export default function EventLoopViz({ task }: EventLoopVizProps) {
  const steps = useMemo<SimulationStep[]>(() => buildSim(task) as SimulationStep[], [task]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const isLastStep = index >= steps.length - 1;

  useEffect(() => {
    if (!playing || isLastStep) return;

    const timer = window.setTimeout(() => setIndex((currentIndex) => currentIndex + 1), 1700);
    return () => window.clearTimeout(timer);
  }, [playing, isLastStep]);

  const step = steps[index];
  return (
    <div className={s.viz}>
      <div className={s.controls}>
        <button className={s.ctrl} onClick={() => { setPlaying(false); setIndex((currentIndex) => Math.max(0, currentIndex - 1)); }}>‹</button>
        <button className={`${s.ctrl} ${s.ctrlPlay}`} onClick={() => { if (isLastStep) { setIndex(0); setPlaying(true); } else setPlaying((isPlaying) => !isPlaying); }}>{playing && !isLastStep ? "❚❚" : isLastStep ? "↻" : "▶"}</button>
        <button className={s.ctrl} onClick={() => { setPlaying(false); setIndex((currentIndex) => Math.min(steps.length - 1, currentIndex + 1)); }}>›</button>
        <span className={s.counter}>{index + 1}/{steps.length}</span><span key={index} className={s.note}>{step.note}</span>
      </div>
      <div className={s.progress}><div className={s.progressFill} style={{ width: `${((index + 1) / steps.length) * 100}%` }} /></div>
      <div className={s.zones}>
        <VizZone title="Call Stack" tone={s.toneAmber} active={step.hl === "stack"} stack>{step.stack.length ? step.stack.map((frame) => <VizChip key={frame} tone={s.toneAmber} wide>{frame}</VizChip>) : <span className={s.empty}>пусто</span>}</VizZone>
        <div className={s.queues}>
          <VizZone title="Microtask Queue" tone={s.toneKw} active={step.hl === "micro"} row>{step.micro.length ? step.micro.map((group) => <VizChip key={group} tone={s.toneKw}>{group}</VizChip>) : <span className={s.empty}>—</span>}</VizZone>
          <VizZone title="Task Queue (setTimeout)" tone={s.toneNum} active={step.hl === "macro"} row>{step.macro.length ? step.macro.map((group) => <VizChip key={group} tone={s.toneNum}>{group}</VizChip>) : <span className={s.empty}>—</span>}</VizZone>
        </div>
      </div>
      <div className={`${s.console} ${step.hl === "out" ? s.consoleActive : ""}`}><span className={s.consoleLabel}>CONSOLE</span>{step.out.map((label) => <span key={label} className={s.outChip}>&apos;{label}&apos;</span>)}{!step.out.length && <span className={s.empty}>вывода пока нет</span>}</div>
    </div>
  );
}
