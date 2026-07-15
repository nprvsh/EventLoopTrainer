import { useCallback, useState } from "react";
import type { CSSProperties } from "react";
import { localizedStrings, StringsProvider } from "@/config/strings";
import { useColorTheme, useLocale, useTaskSession } from "@/hooks";
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
import type { CodeLineState, LevelKey, ThemeKey } from "@/types";
import s from "./App.module.css";

type QueueFlight = {
  id: number;
  label: string;
  fromX: number;
  fromY: number;
  width: number;
  toX: number;
  toY: number;
};

export default function App() {
  const [level, setLevel] = useState<LevelKey>("easy");
  const [theme, setTheme] = useState<ThemeKey>("all");
  const [colorTheme, setColorTheme] = useColorTheme();
  const [locale, setLocale] = useLocale();

  const [isExplanationVisible, setIsExplanationVisible] = useState(false);
  const [isVisualizationVisible, setIsVisualizationVisible] = useState(false);
  const [activeCodeLine, setActiveCodeLine] = useState<number | null>(null);
  const [activeCodeLineState, setActiveCodeLineState] = useState<CodeLineState | null>(null);
  const [queueFlight, setQueueFlight] = useState<QueueFlight | null>(null);

  const resetPresentation = () => {
    setIsExplanationVisible(false);
    setIsVisualizationVisible(false);
    setActiveCodeLine(null);
    setActiveCodeLineState(null);
    setQueueFlight(null);
  };

  const session = useTaskSession({ level, theme, onTaskReset: resetPresentation });
  const { task, checked } = session;

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
          stats={session.stats}
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
            session.requestNewTask();
          }}
          onThemeChange={(nextTheme) => {
            setTheme(nextTheme);
            session.requestNewTask();
          }}
          onNewTask={session.requestNewTask}
        />
        <main className={s.workspace}>
          <section className={s.codeColumn} aria-label={strings.app.codeColumnAriaLabel}>
            <h2 className={s.columnTitle}>{strings.app.codeColumn}</h2>
            <TaskCodePanel
              task={task}
              loadError={session.hasTaskLoadError}
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
              {task && <TokenPicker tokens={task.tokens} usedIndices={session.usedIndices} disabled={checked} onPlace={session.place} />}
              {task && <AnswerConsole task={task} answer={session.answer} checked={checked} result={session.result} onUnplace={session.unplace} />}
              {task && (
                <TaskActions
                  answer={session.answer}
                  checked={checked}
                  done={session.isComplete}
                  isWin={session.isWin}
                  isVisualizationVisible={isVisualizationVisible}
                  isExplanationVisible={isExplanationVisible}
                  onCheck={session.check}
                  onReset={session.resetAnswer}
                  onNextTask={session.requestNewTask}
                  onRetryLastMistake={session.retryLastMistake}
                  mistakesCount={session.mistakes.length}
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
