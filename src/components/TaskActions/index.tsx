import { useStrings } from "@/config/strings";
import controls from "@/styles/controls.module.css";
import s from "./TaskActions.module.css";

type TaskActionsProps = {
  answer: number[];
  checked: boolean;
  done: boolean;
  isWin: boolean;
  isVisualizationVisible: boolean;
  isExplanationVisible: boolean;
  onCheck: () => void;
  onReset: () => void;
  onNextTask: () => void;
  onRetryLastMistake: () => void;
  mistakesCount: number;
  onToggleVisualization: () => void;
  onToggleExplanation: () => void;
};

export default function TaskActions({
  answer,
  checked,
  done,
  isWin,
  isVisualizationVisible,
  isExplanationVisible,
  onCheck,
  onReset,
  onNextTask,
  onRetryLastMistake,
  mistakesCount,
  onToggleVisualization,
  onToggleExplanation,
}: TaskActionsProps) {
  const strings = useStrings();

  return (
    <div className={s.actions}>
      {!checked ? (
        <>
          <button className={s.primary} onClick={onCheck} disabled={!done}>
            {strings.taskActions.check}
          </button>
          <button className={controls.btn} onClick={onReset} disabled={!answer.length}>
            {strings.taskActions.reset}
          </button>
          {mistakesCount > 0 && (
            <button className={controls.btn} onClick={onRetryLastMistake}>
              {strings.taskActions.retryMistakes(mistakesCount)}
            </button>
          )}
        </>
      ) : (
        <>
          <span className={`${s.verdict} ${isWin ? s.verdictWin : s.verdictLose}`}>
            {isWin ? strings.taskActions.correct : strings.taskActions.incorrect}
          </span>
          <button className={s.primary} onClick={onNextTask}>
            {strings.taskActions.next}
          </button>
          {!isWin && mistakesCount > 0 && (
            <button className={controls.btn} onClick={onRetryLastMistake}>
              {strings.taskActions.retryTask}
            </button>
          )}
          <button
            className={`${controls.btn} ${isVisualizationVisible ? controls.btnActive : ""}`}
            onClick={onToggleVisualization}
          >
            {isVisualizationVisible ? strings.taskActions.hideAnimation : strings.taskActions.showAnimation}
          </button>
          <button className={controls.btn} onClick={onToggleExplanation}>
            {isExplanationVisible ? strings.taskActions.hideExplanation : strings.taskActions.showExplanation}
          </button>
        </>
      )}
    </div>
  );
}
