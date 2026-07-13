import { useEffect, useRef, type CSSProperties } from "react";
import { highlightLine } from "@/components/Highlight";
import { strings } from "@/config/strings";
import type { CodeLineState, Task } from "@/types";
import s from "./TaskCodePanel.module.css";

type TaskCodePanelProps = {
  task: Task | null;
  activeLine?: number | null;
  activeLineState?: CodeLineState | null;
  onQueueEntry?: (line: number, bounds: DOMRect) => void;
}

export default function TaskCodePanel({ task, activeLine = null, activeLineState = null, onQueueEntry }: TaskCodePanelProps) {
  const codeBodyRef = useRef<HTMLDivElement>(null);
  const hasActiveLine = activeLine !== null && activeLineState !== null;
  const highlightClass = activeLineState === "queued" ? s.lineQueued : s.lineExecuting;
  const highlightStyle = hasActiveLine
    ? ({ "--active-line-index": activeLine ?? 0 } as CSSProperties)
    : undefined;

  useEffect(() => {
    if (activeLineState !== "queued" || activeLine === null) return;

    const line = codeBodyRef.current?.querySelector<HTMLElement>(`[data-code-line="${activeLine}"]`);
    if (line) onQueueEntry?.(activeLine, line.getBoundingClientRect());
  }, [activeLine, activeLineState, onQueueEntry]);

  return (
    <div className={s.codePanel}>
      <div className={s.codeHeader}><span className={s.dot} /><span className={s.dot} /><span className={s.dot} /><span className={s.fileName}>{strings.taskCodePanel.fileName}</span></div>
      <div ref={codeBodyRef} className={s.codeBody}>
        {hasActiveLine && <div className={`${s.lineHighlight} ${highlightClass}`} style={highlightStyle} />}
        {task ? task.lines.map((line, index) => highlightLine(line, index)) : <div className={s.loading}>{strings.taskCodePanel.loading}</div>}
      </div>
    </div>
  );
}
