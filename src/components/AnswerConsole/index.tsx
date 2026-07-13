import type { Task } from "@/types";
import s from "./AnswerConsole.module.css";

type AnswerConsoleProps = {
  task: Task;
  answer: number[];
  checked: boolean;
  result: boolean[] | null;
  onUnplace: (position: number) => void;
};

export default function AnswerConsole({
  task,
  answer,
  checked,
  result,
  onUnplace,
}: AnswerConsoleProps) {
  return (
    <div className={s.consoleBox}>
      <div className={s.consoleHeader}>Console — твой прогноз</div>
      <div className={s.consoleBody}>
        {task.truth.map((_, position) => {
          const filled = position < answer.length;
          const token = filled ? task.tokens[answer[position]] : null;
          const isCorrect = checked && result ? result[position] : null;
          return (
            <button
              type="button"
              key={position}
              disabled={!filled || checked}
              onClick={() => onUnplace(position)}
              className={`${s.row} ${filled && !checked ? s.rowClickable : ""}`}
              title={filled && !checked ? "убрать" : undefined}
            >
              <span className={s.prompt}>{"›"}</span>
              {filled ? (
                <>
                  <span className={isCorrect === null ? s.tokPending : isCorrect ? s.tokOk : s.tokBad}>
                    &apos;{token}&apos;
                  </span>
                  {checked && !isCorrect && (
                    <span className={s.fixHint}>
                      → должно быть <span className={s.tokOk}>&apos;{task.truth[position]}&apos;</span>
                    </span>
                  )}
                  {checked && isCorrect && <span className={s.checkMark}>✓</span>}
                </>
              ) : position === answer.length ? (
                <span className={s.cursor} />
              ) : (
                <span className={s.placeholder}>·</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
