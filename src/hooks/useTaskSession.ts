import { useEffect, useState } from "react";
import { generateTask } from "@/lib";
import type { LevelKey, Stats, Task, ThemeKey } from "@/types";
import { usePersistentState } from "./usePersistentState";

const STATS_STORAGE_KEY = "event-loop-trainer:stats";
const MISTAKES_STORAGE_KEY = "event-loop-trainer:mistakes";
const MAX_SAVED_MISTAKES = 10;

const emptyStats: Stats = { streak: 0, best: 0, solved: 0, total: 0 };

type TaskSessionOptions = {
  level: LevelKey;
  theme: ThemeKey;
  /** Вызывается при любой смене задачи — сброс состояния презентации (анимации, разбор). */
  onTaskReset: () => void;
};

// Жизненный цикл задачи: генерация, сбор ответа, проверка, статистика и ошибки.
export function useTaskSession({ level, theme, onTaskReset }: TaskSessionOptions) {
  const [task, setTask] = useState<Task | null>(null);
  const [hasTaskLoadError, setHasTaskLoadError] = useState(false);
  const [answer, setAnswer] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<boolean[] | null>(null);
  const [taskRequest, setTaskRequest] = useState(0);
  const [stats, setStats] = usePersistentState<Stats>(STATS_STORAGE_KEY, emptyStats);
  const [mistakes, setMistakes] = usePersistentState<Task[]>(MISTAKES_STORAGE_KEY, []);

  const resetProgress = () => {
    setAnswer([]);
    setChecked(false);
    setResult(null);
    onTaskReset();
  };

  const requestNewTask = () => {
    setTask(null);
    setHasTaskLoadError(false);
    resetProgress();
    setTaskRequest((request) => request + 1);
  };

  useEffect(() => {
    let cancelled = false;

    generateTask(level, theme)
      .then((nextTask) => {
        if (cancelled) return;
        setTask(nextTask);
        setHasTaskLoadError(nextTask === null);
      })
      .catch(() => {
        if (!cancelled) setHasTaskLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [level, theme, taskRequest]);

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
    if (!isWin) {
      setMistakes((currentMistakes) => [
        task,
        ...currentMistakes.filter((savedTask) => savedTask.lines.join("\n") !== task.lines.join("\n")),
      ].slice(0, MAX_SAVED_MISTAKES));
    }
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

  const retryLastMistake = () => {
    const mistake = mistakes[0];
    if (!mistake) return;

    setTask(mistake);
    resetProgress();
  };

  const usedIndices = new Set(answer);
  const isComplete = task !== null && answer.length === task.truth.length;
  const isWin = checked && result !== null && result.every(Boolean);

  return {
    task,
    hasTaskLoadError,
    answer,
    checked,
    result,
    stats,
    mistakes,
    usedIndices,
    isComplete,
    isWin,
    requestNewTask,
    place,
    unplace,
    check,
    resetAnswer: () => setAnswer([]),
    retryLastMistake,
  };
}
