import { PHASES } from "@/data";
import type { Task } from "@/types";
import s from "./TaskExplanation.module.css";

interface TaskExplanationProps {
  task: Task;
}

export default function TaskExplanation({ task }: TaskExplanationProps) {
  return (
    <div className={s.reveal}>
      <div className={s.revealTitle}>ПОЧЕМУ ТАКОЙ ПОРЯДОК</div>
      {task.truth.map((token, index) => {
        const phase = PHASES[task.phaseMap[token]] ?? PHASES.sync;
        return <div key={index} className={s.revealRow}><span className={s.revealNum}>{index + 1}.</span><span className={s.revealTok}>'{token}'</span><span className={s.revealPhase}>{phase.name}</span><span className={s.revealHint}>{phase.hint}</span></div>;
      })}
      <div className={s.rule}>Правило: <strong>синхронный код</strong> → <strong>все микрозадачи</strong> (Promise.then, queueMicrotask, код после await) → <strong>макрозадачи</strong> (setTimeout) по одной, и после каждой — снова все микрозадачи.</div>
    </div>
  );
}
