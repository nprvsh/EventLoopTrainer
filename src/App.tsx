import { useEffect, useState } from "react";
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
import type { ColorModeKey, ColorThemeKey, LevelKey, Stats, Task, ThemeKey } from "@/types";
import s from "./App.module.css";

const STATS_STORAGE_KEY = "event-loop-trainer:stats";
const MISTAKES_STORAGE_KEY = "event-loop-trainer:mistakes";
const COLOR_THEME_STORAGE_KEY = "event-loop-trainer:color-theme";
const COLOR_MODE_STORAGE_KEY = "event-loop-trainer:color-mode";
const emptyStats: Stats = { streak: 0, best: 0, solved: 0, total: 0 };
const colorThemes: ColorThemeKey[] = ["midnight", "ocean", "forest", "rose"];
const colorModes: ColorModeKey[] = ["dark", "light"];
const themeColors: Record<ColorModeKey, Record<ColorThemeKey, string>> = {
  dark: { midnight: "#14161F", ocean: "#071923", forest: "#101A14", rose: "#20131E" },
  light: { midnight: "#F7F8FC", ocean: "#F1FAFD", forest: "#F4F9F1", rose: "#FDF5FA" },
};

export default function App() {
  const [level, setLevel] = useState<LevelKey>("easy");
  const [theme, setTheme] = useState<ThemeKey>("all");
  const [colorTheme, setColorTheme] = useState<ColorThemeKey>(() => {
    const savedTheme = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
    return colorThemes.includes(savedTheme as ColorThemeKey) ? savedTheme as ColorThemeKey : "midnight";
  });
  const [colorMode, setColorMode] = useState<ColorModeKey>(() => {
    const savedMode = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    return colorModes.includes(savedMode as ColorModeKey) ? savedMode as ColorModeKey : "dark";
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
  const [taskRequest, setTaskRequest] = useState(0);

  const requestNewTask = () => {
    setTask(null);
    setAnswer([]);
    setChecked(false);
    setResult(null);
    setIsExplanationVisible(false);
    setIsVisualizationVisible(false);
    setActiveCodeLine(null);
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
    document.documentElement.dataset.colorMode = colorMode;
    document.documentElement.style.colorScheme = colorMode;
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, colorMode);

    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute("content", themeColors[colorMode][colorTheme]);
  }, [colorMode, colorTheme]);

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
  };

  return (
    <div className={s.page}>
      <div className={s.wrap}>
        <TrainerHeader
          stats={stats}
          colorTheme={colorTheme}
          colorMode={colorMode}
          onColorThemeChange={setColorTheme}
          onColorModeChange={setColorMode}
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
        <TaskCodePanel task={task} activeLine={activeCodeLine} />
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
              if (value) setActiveCodeLine(null);
              return !value;
            })}
            onToggleExplanation={() => setIsExplanationVisible((value) => !value)}
          />
        )}
        {task && checked && isVisualizationVisible && <EventLoopViz task={task} onStepChange={setActiveCodeLine} />}
        {task && checked && isExplanationVisible && <TaskExplanation task={task} />}
      </div>
    </div>
  );
}
