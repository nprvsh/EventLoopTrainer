import controls from "@/styles/controls.module.css";
import s from "./TaskActions.module.css";

interface TaskActionsProps {
  answer: number[];
  checked: boolean;
  done: boolean;
  isWin: boolean;
  isVisualizationVisible: boolean;
  isExplanationVisible: boolean;
  onCheck: () => void;
  onReset: () => void;
  onNextTask: () => void;
  onToggleVisualization: () => void;
  onToggleExplanation: () => void;
}

export default function TaskActions({ answer, checked, done, isWin, isVisualizationVisible, isExplanationVisible, onCheck, onReset, onNextTask, onToggleVisualization, onToggleExplanation }: TaskActionsProps) {
  return (
    <div className={s.actions}>
      {!checked ? <><button className={s.primary} onClick={onCheck} disabled={!done}>Проверить</button><button className={controls.btn} onClick={onReset} disabled={!answer.length}>сбросить</button></> : <><span className={`${s.verdict} ${isWin ? s.verdictWin : s.verdictLose}`}>{isWin ? "✓ Верно!" : "✗ Не совсем"}</span><button className={s.primary} onClick={onNextTask}>Следующая →</button><button className={`${controls.btn} ${isVisualizationVisible ? controls.btnActive : ""}`} onClick={onToggleVisualization}>{isVisualizationVisible ? "⏹ скрыть анимацию" : "▶ анимация event loop"}</button><button className={controls.btn} onClick={onToggleExplanation}>{isExplanationVisible ? "скрыть разбор" : "разбор"}</button></>}
    </div>
  );
}
