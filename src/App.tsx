import { useEffect, useState } from "react";
import { generateTask } from "./lib";
import {
  AnswerConsole,
  EventLoopViz,
  LevelSelector,
  TaskActions,
  TaskCodePanel,
  TaskExplanation,
  TokenPicker,
  TrainerHeader,
} from "./components";
import type { LevelKey, Stats, Task } from "./types";
import s from "./App.module.css";

export default function App() {
  const [level, setLevel] = useState<LevelKey>("easy");
  const [task, setTask] = useState<Task | null>(null);
  const [answer, setAnswer] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<boolean[] | null>(null);
  const [stats, setStats] = useState<Stats>({ streak: 0, best: 0, solved: 0, total: 0 });
  const [reveal, setReveal] = useState(false);
  const [viz, setViz] = useState(false);
  const [taskRequest, setTaskRequest] = useState(0);

  const requestNewTask = () => {
    setTask(null);
    setAnswer([]);
    setChecked(false);
    setResult(null);
    setReveal(false);
    setViz(false);
    setTaskRequest((request) => request + 1);
  };

  useEffect(() => {
    let cancelled = false;

    generateTask(level).then((nextTask) => {
      if (!cancelled) setTask(nextTask);
    });

    return () => {
      cancelled = true;
    };
  }, [level, taskRequest]);

  const place = (index: number) => {
    if (!checked) setAnswer((currentAnswer) => [...currentAnswer, index]);
  };

  const unplace = (position: number) => {
    if (!checked) setAnswer((currentAnswer) => currentAnswer.filter((_, index) => index !== position));
  };

  const check = () => {
    if (!task) return;

    const sequence = answer.map((index) => task.tokens[index]);
    const nextResult = sequence.map((value, index) => value === task.truth[index]);
    const isWin = nextResult.every(Boolean);
    setResult(nextResult);
    setChecked(true);
    setStats((currentStats) => {
      const streak = isWin ? currentStats.streak + 1 : 0;
      return {
        streak,
        best: Math.max(currentStats.best, streak),
        solved: currentStats.solved + (isWin ? 1 : 0),
        total: currentStats.total + 1,
      };
    });
  };

  const usedIndices = new Set(answer);
  const isComplete = task !== null && answer.length === task.truth.length;
  const isWin = checked && result !== null && result.every(Boolean);

  return (
    <div className={s.page}>
      <div className={s.wrap}>
        <TrainerHeader stats={stats} />
        <LevelSelector
          level={level}
          onLevelChange={(nextLevel) => {
            setLevel(nextLevel);
            requestNewTask();
          }}
          onNewTask={requestNewTask}
        />
        <TaskCodePanel task={task} />
        {task && <TokenPicker tokens={task.tokens} usedIndices={usedIndices} disabled={checked} onPlace={place} />}
        {task && <AnswerConsole task={task} answer={answer} checked={checked} result={result} onUnplace={unplace} />}
        {task && (
          <TaskActions
            answer={answer}
            checked={checked}
            done={isComplete}
            isWin={isWin}
            isVisualizationVisible={viz}
            isExplanationVisible={reveal}
            onCheck={check}
            onReset={() => setAnswer([])}
            onNextTask={requestNewTask}
            onToggleVisualization={() => setViz((value) => !value)}
            onToggleExplanation={() => setReveal((value) => !value)}
          />
        )}
        {task && checked && viz && <EventLoopViz task={task} />}
        {task && checked && reveal && <TaskExplanation task={task} />}
      </div>
    </div>
  );
}
