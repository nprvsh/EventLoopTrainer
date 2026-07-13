import { strings } from "@/config/strings";
import { PHASES } from "@/data";
import type { Task } from "@/types";
import s from "./TaskExplanation.module.css";

type TaskExplanationProps = {
  task: Task;
}

export default function TaskExplanation({ task }: TaskExplanationProps) {
  return (
    <div className={s.reveal}>
      <div className={s.revealTitle}>{strings.taskExplanation.title}</div>
      {task.truth.map((token, index) => {
        const phase = PHASES[task.phaseMap[token]] ?? PHASES.sync;
        return <div key={index} className={s.revealRow}><span className={s.revealNum}>{index + 1}.</span><span className={s.revealTok}>&apos;{token}&apos;</span><span className={s.revealPhase}>{phase.name}</span><span className={s.revealHint}>{phase.hint}</span></div>;
      })}
      <div className={s.rule}>
        {strings.taskExplanation.rule.prefix}
        <strong>{strings.taskExplanation.rule.syncCode}</strong>
        {" → "}
        <strong>{strings.taskExplanation.rule.allMicrotasks}</strong>
        {strings.taskExplanation.rule.microtaskExamples}
        {" → "}
        <strong>{strings.taskExplanation.rule.macrotasks}</strong>
        {strings.taskExplanation.rule.macrotaskExamples}
      </div>
    </div>
  );
}
