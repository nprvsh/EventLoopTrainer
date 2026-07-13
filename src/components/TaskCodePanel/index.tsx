import { highlightLine } from "@/components/Highlight";
import type { Task } from "@/types";
import s from "./TaskCodePanel.module.css";

type TaskCodePanelProps = {
  task: Task | null;
  activeLine?: number | null;
}

export default function TaskCodePanel({ task, activeLine = null }: TaskCodePanelProps) {
  return (
    <div className={s.codePanel}>
      <div className={s.codeHeader}><span className={s.dot} /><span className={s.dot} /><span className={s.dot} /><span className={s.fileName}>task.js</span></div>
      <div className={s.codeBody}>{task ? task.lines.map((line, index) => highlightLine(line, index, index === activeLine ? s.lineActive : undefined)) : <div className={s.loading}>{"// собираю задачу…"}</div>}</div>
    </div>
  );
}
