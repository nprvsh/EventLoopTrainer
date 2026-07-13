import { useEffect, useMemo, useState } from "react";
import { strings } from "@/config/strings";
import { buildSim } from "@/lib";
import type { CodeLineState, SimulationStep, Task } from "@/types";
import s from "./EventLoopViz.module.css";
import VizChip from "./VizChip";
import VizZone from "./VizZone";

const zoneClassNames = {
  zone: s.zone,
  stack: s.zoneStack,
  queue: s.zoneQueue,
  active: s.zoneActive,
  title: s.zoneTitle,
  body: s.zoneBody,
  row: s.zoneBodyRow,
};

type EventLoopVizProps = {
  task: Task;
  onStepChange?: (codeLine: number | null, codeLineState: CodeLineState | null) => void;
};

export default function EventLoopViz({ task, onStepChange }: EventLoopVizProps) {
  const steps = useMemo<SimulationStep[]>(() => buildSim(task) as SimulationStep[], [task]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const isLastStep = index >= steps.length - 1;

  useEffect(() => {
    if (!playing || isLastStep) return;

    const timer = window.setTimeout(() => setIndex((currentIndex) => currentIndex + 1), 1700);
    return () => window.clearTimeout(timer);
  }, [playing, index, isLastStep]);

  const step = steps[index];
  useEffect(() => {
    onStepChange?.(step.codeLine, step.codeLineState);
  }, [onStepChange, step.codeLine, step.codeLineState]);

  const activeCallback = step.stack[0]?.replace("callback ", "");
  const isDrainingMicrotasks = step.micro.length > 0 && step.stack.length === 0;
  const eventLoopMessage = activeCallback
    ? strings.eventLoopViz.callbackRunning
    : isDrainingMicrotasks
      ? strings.eventLoopViz.drainMicrotasks
      : step.macro.length > 0
        ? strings.eventLoopViz.takeMacrotask
        : strings.eventLoopViz.waiting;

  const showPreviousStep = () => {
    setPlaying(false);
    setIndex((currentIndex) => Math.max(0, currentIndex - 1));
  };

  const togglePlayback = () => {
    if (isLastStep) {
      setIndex(0);
      setPlaying(true);
      return;
    }

    setPlaying((isPlaying) => !isPlaying);
  };

  const showNextStep = () => {
    setPlaying(false);
    setIndex((currentIndex) => Math.min(steps.length - 1, currentIndex + 1));
  };

  return (
    <div className={s.viz}>
      <div className={s.controls}>
        <button className={s.ctrl} aria-label={strings.eventLoopViz.previousStep} disabled={index === 0} onClick={showPreviousStep}>
          ‹
        </button>
        <button
          className={`${s.ctrl} ${s.ctrlPlay}`}
          aria-label={isLastStep ? strings.eventLoopViz.restart : playing ? strings.eventLoopViz.pause : strings.eventLoopViz.continue}
          onClick={togglePlayback}
        >
          {playing && !isLastStep ? "❚❚" : isLastStep ? "↻" : "▶"}
        </button>
        <button className={s.ctrl} aria-label={strings.eventLoopViz.nextStep} disabled={isLastStep} onClick={showNextStep}>
          ›
        </button>
        <span className={s.counter}>
          {index + 1}/{steps.length}
        </span>
        <div key={index} className={s.reason}>
          <span className={s.reasonLabel}>{strings.eventLoopViz.reason}</span>
          <span className={s.note}>{step.note}</span>
        </div>
      </div>
      <div className={s.progress}>
        <div className={s.progressFill} style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
      </div>
      <div className={s.zones}>
        <VizZone
          title={strings.eventLoopViz.callStack}
          tone={s.toneAmber}
          active={step.hl === "stack" || Boolean(activeCallback)}
          stack
          classNames={zoneClassNames}
        >
          {step.stack.length ? (
            step.stack.map((frame) => (
              <VizChip key={frame} tone={s.toneAmber} wide className={s.chip} wideClassName={s.chipWide}>
                {frame}
              </VizChip>
            ))
          ) : (
            <span className={s.empty}>{strings.eventLoopViz.empty}</span>
          )}
        </VizZone>
        <div className={s.flow} aria-label={strings.eventLoopViz.flowAriaLabel}>
          <span className={s.flowArrow}>⇄</span>
          <span className={s.flowCaption}>{eventLoopMessage}</span>
        </div>
        <div className={s.queues}>
          <VizZone
            title={strings.eventLoopViz.microtaskQueue}
            tone={s.toneKw}
            active={step.hl === "micro" || isDrainingMicrotasks}
            row
            queueZone="micro"
            pendingLabel={strings.eventLoopViz.pending}
            classNames={zoneClassNames}
          >
            {step.micro.length ? (
              step.micro.map((group, groupIndex) => (
                <VizChip key={group} tone={s.toneKw} className={s.chip} wideClassName={s.chipWide}>
                  {groupIndex === 0 ? strings.eventLoopViz.nextQueueItem(group) : group}
                </VizChip>
              ))
            ) : (
              <span className={s.empty}>—</span>
            )}
          </VizZone>
          <VizZone
            title={strings.eventLoopViz.taskQueue}
            tone={s.toneNum}
            active={step.hl === "macro"}
            row
            queueZone="macro"
            pendingLabel={strings.eventLoopViz.pending}
            classNames={zoneClassNames}
          >
            {step.macro.length ? (
              step.macro.map((group, groupIndex) => (
                <VizChip key={group} tone={s.toneNum} className={s.chip} wideClassName={s.chipWide}>
                  {groupIndex === 0 ? strings.eventLoopViz.nextQueueItem(group) : group}
                </VizChip>
              ))
            ) : (
              <span className={s.empty}>—</span>
            )}
          </VizZone>
        </div>
      </div>
      <div className={`${s.console} ${step.hl === "out" ? s.consoleActive : ""}`}>
        <span className={s.consoleLabel}>{strings.eventLoopViz.console}</span>
        {step.out.map((label) => (
          <span key={label} className={s.outChip}>
            &apos;{label}&apos;
          </span>
        ))}
        {!step.out.length && <span className={s.empty}>{strings.eventLoopViz.noOutput}</span>}
      </div>
    </div>
  );
}
