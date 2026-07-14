import { useEffect, useMemo, useReducer, useState } from "react";
import { useStrings } from "@/config/strings";
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

type EventLoopVizIdleProps = {
  message: string;
};

type QueueChipState = {
  label: string;
  state: "entering" | "idle" | "leaving";
};

type AnimatedQueueChipsProps = {
  groups: string[];
  tone: string;
  emptyLabel: string;
};

type QueueChipAction =
  | { type: "sync"; groups: string[] }
  | { type: "finish"; label: string; state: QueueChipState["state"] };

function queueChipsReducer(chips: QueueChipState[], action: QueueChipAction): QueueChipState[] {
  if (action.type === "finish") {
    return chips
      .filter((chip) => !(chip.label === action.label && action.state === "leaving"))
      .map((chip) => chip.label === action.label && action.state === "entering" ? { ...chip, state: "idle" } : chip);
  }

  const currentLabels = new Set(chips.map(({ label }) => label));
  const nextLabels = new Set(action.groups);
  const nextChips = action.groups.map((label) => {
    const currentChip = chips.find((chip) => chip.label === label);
    return currentChip ?? { label, state: "entering" as const };
  });
  const leavingChips = chips
    .filter((chip) => !nextLabels.has(chip.label) && chip.state !== "leaving")
    .map((chip) => ({ ...chip, state: "leaving" as const }));

  if (currentLabels.size === action.groups.length && leavingChips.length === 0) return chips;
  return [...nextChips, ...leavingChips];
}

function AnimatedQueueChips({ groups, tone, emptyLabel }: AnimatedQueueChipsProps) {
  const [chips, dispatch] = useReducer(queueChipsReducer, groups, (initialGroups) =>
    initialGroups.map((label) => ({ label, state: "entering" })),
  );

  useEffect(() => {
    dispatch({ type: "sync", groups });
  }, [groups]);

  const finishAnimation = (label: string, state: QueueChipState["state"]) => {
    dispatch({ type: "finish", label, state });
  };

  return (
    <>
      {chips.map(({ label, state }) => (
        <VizChip
          key={label}
          tone={tone}
          className={`${s.chip} ${state === "entering" ? s.queueChipEnter : state === "leaving" ? s.queueChipExit : ""}`}
          wideClassName={s.chipWide}
          onAnimationEnd={() => state !== "idle" && finishAnimation(label, state)}
        >
          {label}
        </VizChip>
      ))}
      {!chips.length && <span className={s.empty}>{emptyLabel}</span>}
    </>
  );
}

export function EventLoopVizIdle({ message }: EventLoopVizIdleProps) {
  const strings = useStrings();

  return (
    <div className={`${s.viz} ${s.vizIdle}`} aria-disabled="true">
      <div className={s.controls}>
        <button className={s.ctrl} aria-label={strings.eventLoopViz.previousStep} disabled>‹</button>
        <button className={`${s.ctrl} ${s.ctrlPlay}`} aria-label={strings.eventLoopViz.continue} disabled>▶</button>
        <button className={s.ctrl} aria-label={strings.eventLoopViz.nextStep} disabled>›</button>
        <span className={s.counter}>—/—</span>
        <div className={s.reason}>
          <span className={s.reasonLabel}>{strings.eventLoopViz.reason}</span>
          <span className={s.note}>{message}</span>
        </div>
      </div>
      <div className={s.progress}><div className={s.progressFill} /></div>
      <div className={s.zones}>
        <VizZone
          title={strings.eventLoopViz.callStack}
          tone={s.toneAmber}
          active={false}
          stack
          classNames={zoneClassNames}
        >
          <span className={s.empty}>{strings.eventLoopViz.empty}</span>
        </VizZone>
        <div className={s.flow} aria-hidden="true">
          <span className={s.flowArrow}>⇄</span>
        </div>
        <div className={s.queues}>
          <VizZone
            title={strings.eventLoopViz.microtaskQueue}
            tone={s.toneKw}
            active={false}
            row
            pendingLabel={strings.eventLoopViz.pending}
            classNames={zoneClassNames}
          >
            <span className={s.empty}>—</span>
          </VizZone>
          <VizZone
            title={strings.eventLoopViz.taskQueue}
            tone={s.toneNum}
            active={false}
            row
            pendingLabel={strings.eventLoopViz.pending}
            classNames={zoneClassNames}
          >
            <span className={s.empty}>—</span>
          </VizZone>
        </div>
      </div>
      <div className={s.console}>
        <span className={s.consoleLabel}>{strings.eventLoopViz.console}</span>
        <span className={s.empty}>{strings.eventLoopViz.noOutput}</span>
      </div>
    </div>
  );
}

export default function EventLoopViz({ task, onStepChange }: EventLoopVizProps) {
  const strings = useStrings();
  const steps = useMemo<SimulationStep[]>(() => buildSim(task, strings.sim) as SimulationStep[], [task, strings.sim]);
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
            <AnimatedQueueChips groups={step.micro} tone={s.toneKw} emptyLabel="—" />
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
            <AnimatedQueueChips groups={step.macro} tone={s.toneNum} emptyLabel="—" />
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
