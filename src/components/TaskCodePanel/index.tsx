import { highlightLine } from "@/components/Highlight";
import type { Task } from "@/types";
import s from "./TaskCodePanel.module.css";

interface TaskCodePanelProps {
  task: Task | null;
}

export default function TaskCodePanel({ task }: TaskCodePanelProps) {
  return (
    <div className={s.codePanel}>
      <div className={s.codeHeader}><span className={s.dot} /><span className={s.dot} /><span className={s.dot} /><span className={s.fileName}>task.js</span></div>
      <div className={s.codeBody}>{task ? task.lines.map((line, index) => highlightLine(line, index)) : <div className={s.loading}>{"// собираю задачу…"}</div>}</div>
    </div>
  );
}
