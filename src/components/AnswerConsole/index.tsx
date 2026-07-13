import type { Task } from "@/types";
import s from "./AnswerConsole.module.css";

interface AnswerConsoleProps {
  task: Task;
  answer: number[];
  checked: boolean;
  result: boolean[] | null;
  onUnplace: (position: number) => void;
}

export default function AnswerConsole({ task, answer, checked, result, onUnplace }: AnswerConsoleProps) {
  return (
    <div className={s.consoleBox}>
      <div className={s.consoleHeader}>Console — твой прогноз</div>
      <div className={s.consoleBody}>
        {task.truth.map((_, position) => {
          const filled = position < answer.length;
          const token = filled ? task.tokens[answer[position]] : null;
          const isCorrect = checked && result ? result[position] : null;
          return (
            <div key={position} onClick={() => filled && onUnplace(position)} className={`${s.row} ${filled && !checked ? s.rowClickable : ""}`} title={filled && !checked ? "убрать" : undefined}>
              <span className={s.prompt}>{"›"}</span>
              {filled ? <><span className={isCorrect === null ? s.tokPending : isCorrect ? s.tokOk : s.tokBad}>'{token}'</span>{checked && !isCorrect && <span className={s.fixHint}>→ должно быть <span className={s.tokOk}>'{task.truth[position]}'</span></span>}{checked && isCorrect && <span className={s.checkMark}>✓</span>}</> : position === answer.length ? <span className={s.cursor} /> : <span className={s.placeholder}>·</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
