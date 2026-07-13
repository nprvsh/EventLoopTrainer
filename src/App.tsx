import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { strings } from "@/config/strings";
import { generateTask } from "@/lib";
import {
  AnswerConsole,
  EventLoopViz,
  LevelSelector,
  TaskActions,
  TaskCodePanel,
  TaskExplanation,
  TokenPicker,
  TrainerHeader,
} from "@/components";
import type { CodeLineState, ColorThemeKey, LevelKey, Stats, Task, ThemeKey } from "@/types";
import s from "./App.module.css";

const STATS_STORAGE_KEY = "event-loop-trainer:stats";
const MISTAKES_STORAGE_KEY = "event-loop-trainer:mistakes";
const COLOR_THEME_STORAGE_KEY = "event-loop-trainer:color-theme";
const emptyStats: Stats = { streak: 0, best: 0, solved: 0, total: 0 };
const colorThemes: ColorThemeKey[] = ["midnight", "ocean", "forest", "rose"];
type QueueFlight = {
  id: number;
  label: string;
  fromX: number;
  fromY: number;
  width: number;
  toX: number;
  toY: number;
};

const themeColors: Record<ColorThemeKey, string> = {
  midnight: "#14161F",
  ocean: "#071923",
  forest: "#101A14",
  rose: "#20131E",
};

export default function App() {
  const [level, setLevel] = useState<LevelKey>("easy");
  const [theme, setTheme] = useState<ThemeKey>("all");
  const [colorTheme, setColorTheme] = useState<ColorThemeKey>(() => {
    const savedTheme = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
    return colorThemes.includes(savedTheme as ColorThemeKey) ? savedTheme as ColorThemeKey : "midnight";
  });
  const [task, setTask] = useState<Task | null>(null);
  const [answer, setAnswer] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<boolean[] | null>(null);
  const [stats, setStats] = useState<Stats>(() => {
    try {
      return JSON.parse(localStorage.getItem(STATS_STORAGE_KEY) ?? "") as Stats;
    } catch {
      return emptyStats;
    }
  });
  const [mistakes, setMistakes] = useState<Task[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(MISTAKES_STORAGE_KEY) ?? "[]") as Task[];
    } catch {
      return [];
    }
  });
  const [isExplanationVisible, setIsExplanationVisible] = useState(false);
  const [isVisualizationVisible, setIsVisualizationVisible] = useState(false);
  const [activeCodeLine, setActiveCodeLine] = useState<number | null>(null);
  const [activeCodeLineState, setActiveCodeLineState] = useState<CodeLineState | null>(null);
  const [queueFlight, setQueueFlight] = useState<QueueFlight | null>(null);
  const [taskRequest, setTaskRequest] = useState(0);

  const requestNewTask = () => {
    setTask(null);
    setAnswer([]);
    setChecked(false);
    setResult(null);
    setIsExplanationVisible(false);
    setIsVisualizationVisible(false);
    setActiveCodeLine(null);
    setActiveCodeLineState(null);
    setQueueFlight(null);
    setTaskRequest((request) => request + 1);
  };

  useEffect(() => {
    let cancelled = false;

    generateTask(level, theme).then((nextTask) => {
      if (!cancelled) setTask(nextTask);
    });

    return () => {
      cancelled = true;
    };
  }, [level, theme, taskRequest]);

  useEffect(() => {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    document.documentElement.dataset.colorTheme = colorTheme;
    document.documentElement.style.colorScheme = "dark";
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);

    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute("content", themeColors[colorTheme]);
  }, [colorTheme]);

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
      ].slice(0, 10));
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

  const usedIndices = new Set(answer);
  const isComplete = task !== null && answer.length === task.truth.length;
  const isWin = checked && result !== null && result.every(Boolean);
  const retryLastMistake = () => {
    const mistake = mistakes[0];
    if (!mistake) return;

    setTask(mistake);
    setAnswer([]);
    setChecked(false);
    setResult(null);
    setIsExplanationVisible(false);
    setIsVisualizationVisible(false);
    setActiveCodeLine(null);
    setActiveCodeLineState(null);
    setQueueFlight(null);
  };

  const animateQueueEntry = useCallback((line: number, source: DOMRect) => {
    const target = document.querySelector<HTMLElement>('[data-queue-zone][data-active="true"]');
    if (!task || !target) return;

    const targetBounds = target.getBoundingClientRect();
    setQueueFlight({
      id: Date.now(),
      label: task.lines[line],
      fromX: source.left,
      fromY: source.top,
      width: source.width,
      toX: targetBounds.left + 28,
      toY: targetBounds.top + 26,
    });
  }, [task]);

  return (
    <div className={s.page}>
      <div className={s.wrap}>
        <TrainerHeader
          stats={stats}
          colorTheme={colorTheme}
          onColorThemeChange={setColorTheme}
        />
        <LevelSelector
          level={level}
          theme={theme}
          onLevelChange={(nextLevel) => {
            setLevel(nextLevel);
            if (nextLevel === "easy" && theme === "async") setTheme("all");
            requestNewTask();
          }}
          onThemeChange={(nextTheme) => {
            setTheme(nextTheme);
            requestNewTask();
          }}
          onNewTask={requestNewTask}
        />
        <main className={s.workspace}>
          <section className={s.answerColumn} aria-label={strings.app.answerColumn}>
            <h2 className={s.columnTitle}>{strings.app.answerColumn}</h2>
            {task && <TokenPicker tokens={task.tokens} usedIndices={usedIndices} disabled={checked} onPlace={place} />}
            {task && <AnswerConsole task={task} answer={answer} checked={checked} result={result} onUnplace={unplace} />}
            {task && (
              <TaskActions
                answer={answer}
                checked={checked}
                done={isComplete}
                isWin={isWin}
                isVisualizationVisible={isVisualizationVisible}
                isExplanationVisible={isExplanationVisible}
                onCheck={check}
                onReset={() => setAnswer([])}
                onNextTask={requestNewTask}
                onRetryLastMistake={retryLastMistake}
                mistakesCount={mistakes.length}
                onToggleVisualization={() => setIsVisualizationVisible((value) => {
                  if (value) {
                    setActiveCodeLine(null);
                    setActiveCodeLineState(null);
                    setQueueFlight(null);
                  }
                  return !value;
                })}
                onToggleExplanation={() => setIsExplanationVisible((value) => !value)}
              />
            )}
          </section>

          <section className={s.codeColumn} aria-label={strings.app.codeColumnAriaLabel}>
            <h2 className={s.columnTitle}>{strings.app.codeColumn}</h2>
            <TaskCodePanel
              task={task}
              activeLine={activeCodeLine}
              activeLineState={activeCodeLineState}
              onQueueEntry={animateQueueEntry}
            />
          </section>

          <section className={s.visualizationColumn} aria-label={strings.app.visualizationColumnAriaLabel}>
            <h2 className={s.columnTitle}>{strings.app.visualizationColumn}</h2>
            {task && checked && isVisualizationVisible ? (
              <EventLoopViz
                task={task}
                onStepChange={(line, state) => {
                  setActiveCodeLine(line);
                  setActiveCodeLineState(state);
                }}
              />
            ) : (
              <div className={s.visualizationPlaceholder}>
                {checked
                  ? strings.app.visualizationAfterCheck
                  : strings.app.visualizationBeforeCheck}
              </div>
            )}
          </section>
        </main>
        {task && checked && isExplanationVisible && <TaskExplanation task={task} />}
      </div>
      {queueFlight && (
        <span
          key={queueFlight.id}
          className={s.queueFlight}
          style={{
            "--flight-from-x": `${queueFlight.fromX}px`,
            "--flight-from-y": `${queueFlight.fromY}px`,
            "--flight-width": `${queueFlight.width}px`,
            "--flight-to-x": `${queueFlight.toX}px`,
            "--flight-to-y": `${queueFlight.toY}px`,
          } as CSSProperties}
          onAnimationEnd={() => setQueueFlight((current) => current?.id === queueFlight.id ? null : current)}
        >
          {queueFlight.label}
        </span>
      )}
    </div>
  );
}
