import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { seoContent } from "@/config/seo";
import { localizedStrings, StringsProvider } from "@/config/strings";
import { generateTask } from "@/lib";
import {
  AnswerConsole,
  EventLoopGuide,
  EventLoopViz,
  EventLoopVizIdle,
  LevelSelector,
  TaskActions,
  TaskCodePanel,
  TaskExplanation,
  TokenPicker,
  TrainerHeader,
} from "@/components";
import type { CodeLineState, ColorThemeKey, LevelKey, LocaleKey, Stats, Task, ThemeKey } from "@/types";
import s from "./App.module.css";

const STATS_STORAGE_KEY = "event-loop-trainer:stats";
const MISTAKES_STORAGE_KEY = "event-loop-trainer:mistakes";
const COLOR_THEME_STORAGE_KEY = "event-loop-trainer:color-theme";
const LOCALE_STORAGE_KEY = "event-loop-trainer:locale";
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
  const [locale, setLocale] = useState<LocaleKey>(() => {
    // Ссылка на /en/ должна открывать английскую версию независимо от сохранённых настроек.
    if (window.location.pathname.startsWith("/en")) return "en";
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (savedLocale === "ru" || savedLocale === "en") return savedLocale;
    return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
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
  const [hasTaskLoadError, setHasTaskLoadError] = useState(false);

  const requestNewTask = () => {
    setTask(null);
    setHasTaskLoadError(false);
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

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);

    const metadata = seoContent[locale];
    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", metadata.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", metadata.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", metadata.description);
    document.querySelector('meta[property="og:locale"]')?.setAttribute("content", metadata.ogLocale);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", metadata.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", metadata.description);

    const localePath = locale === "en" ? "/en/" : "/";
    if (window.location.pathname !== localePath) window.history.replaceState(null, "", localePath);
    const localeUrl = `https://eventloop.lol${localePath}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", localeUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", localeUrl);
  }, [locale]);

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

  const strings = localizedStrings[locale];
  return (
    <StringsProvider value={strings}>
      <div className={s.page}>
      <div className={s.wrap}>
        <TrainerHeader
          stats={stats}
          colorTheme={colorTheme}
          onColorThemeChange={setColorTheme}
          locale={locale}
          onLocaleChange={setLocale}
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
          <section className={s.codeColumn} aria-label={strings.app.codeColumnAriaLabel}>
            <h2 className={s.columnTitle}>{strings.app.codeColumn}</h2>
            <TaskCodePanel
              task={task}
              loadError={hasTaskLoadError}
              activeLine={activeCodeLine}
              activeLineState={activeCodeLineState}
              onQueueEntry={animateQueueEntry}
            />
          </section>

          <div className={s.rightColumn}>
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
                <EventLoopVizIdle message={checked ? strings.app.visualizationAfterCheck : strings.app.visualizationBeforeCheck} />
              )}
            </section>

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
          </div>
        </main>
        {task && checked && isExplanationVisible && <TaskExplanation task={task} />}
        <EventLoopGuide locale={locale} />
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
    </StringsProvider>
  );
}
