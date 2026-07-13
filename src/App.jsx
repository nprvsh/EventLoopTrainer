import { useState, useEffect, useCallback, useRef } from "react";
import { PHASES } from "./data/phases.js";
import { LEVELS } from "./data/levels.js";
import { generateTask } from "./lib/generator.js";
import { highlightLine } from "./components/highlight.jsx";
import EventLoopViz from "./components/EventLoopViz.jsx";
import s from "./App.module.css";

/* ============================================================
   Тренажер Event Loop — порядок вывода console.log
   Задачи собираются случайно из блоков и РЕАЛЬНО исполняются,
   чтобы получить эталонный порядок. Плюс — анимированная
   визуализация цикла событий для каждой задачи.
   ============================================================ */

export default function App() {
  const [level, setLevel] = useState("easy");
  const [task, setTask] = useState(null);
  const [answer, setAnswer] = useState([]);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({ streak: 0, best: 0, solved: 0, total: 0 });
  const [reveal, setReveal] = useState(false);
  const [viz, setViz] = useState(false);
  const levelRef = useRef(level);
  levelRef.current = level;

  const newTask = useCallback(async (lvl) => {
    setTask(null);
    setAnswer([]);
    setChecked(false);
    setResult(null);
    setReveal(false);
    setViz(false);
    const t = await generateTask(lvl);
    if (levelRef.current === lvl) setTask(t);
  }, []);

  useEffect(() => {
    newTask(level);
  }, [level, newTask]);

  const place = (idx) => {
    if (checked) return;
    setAnswer((a) => [...a, idx]);
  };
  const unplace = (pos) => {
    if (checked) return;
    setAnswer((a) => a.filter((_, i) => i !== pos));
  };

  const check = () => {
    const seq = answer.map((i) => task.tokens[i]);
    const res = seq.map((v, i) => v === task.truth[i]);
    const win = res.every(Boolean);
    setResult(res);
    setChecked(true);
    setStats((st) => {
      const streak = win ? st.streak + 1 : 0;
      return {
        streak,
        best: Math.max(st.best, streak),
        solved: st.solved + (win ? 1 : 0),
        total: st.total + 1,
      };
    });
  };

  const usedIdx = new Set(answer);
  const done = task && answer.length === task.truth.length;
  const win = checked && result && result.every(Boolean);

  return (
    <div className={s.page}>
      <div className={s.wrap}>
        {/* шапка */}
        <div className={s.header}>
          <div>
            <div className={s.kicker}>event loop · тренажер</div>
            <h1 className={s.title}>
              В каком порядке <span className={s.titleFn}>console</span><span>.</span><span className={s.titleAmber}>log</span>?
            </h1>
          </div>
          <div className={s.stats}>
            серия <span className={stats.streak > 0 ? s.statAccent : undefined}>{stats.streak}</span>
            {" · "}рекорд <span className={s.statText}>{stats.best}</span>
            {" · "}решено {stats.solved}/{stats.total}
          </div>
        </div>

        {/* уровни */}
        <div className={s.levels}>
          {Object.entries(LEVELS).map(([k, v]) => (
            <button
              key={k}
              className={`${s.btn} ${level === k ? s.btnActive : ""}`}
              onClick={() => setLevel(k)}
              title={v.desc}
            >
              {v.title}
            </button>
          ))}
          <button className={`${s.btn} ${s.pushRight}`} onClick={() => newTask(level)}>
            ↻ новая задача
          </button>
        </div>

        {/* код */}
        <div className={s.codePanel}>
          <div className={s.codeHeader}>
            <span className={s.dot} />
            <span className={s.dot} />
            <span className={s.dot} />
            <span className={s.fileName}>task.js</span>
          </div>
          <div className={s.codeBody}>
            {task
              ? task.lines.map((l, i) => highlightLine(l, i))
              : <div className={s.loading}>// собираю задачу…</div>}
          </div>
        </div>

        {/* фишки-варианты */}
        {task && (
          <div className={s.tokens}>
            <div className={s.tokensLabel}>
              НАЖИМАЙ В ТОМ ПОРЯДКЕ, В КОТОРОМ ПОЯВИТСЯ ВЫВОД
            </div>
            <div className={s.tokensRow}>
              {task.tokens.map((tok, i) => (
                <button
                  key={i}
                  className={`${s.chip} ${usedIdx.has(i) ? s.chipUsed : ""}`}
                  disabled={usedIdx.has(i) || checked}
                  onClick={() => place(i)}
                >
                  '{tok}'
                </button>
              ))}
            </div>
          </div>
        )}

        {/* консоль — сюда «пишется» ответ */}
        {task && (
          <div className={s.consoleBox}>
            <div className={s.consoleHeader}>Console — твой прогноз</div>
            <div className={s.consoleBody}>
              {task.truth.map((_, pos) => {
                const filled = pos < answer.length;
                const tok = filled ? task.tokens[answer[pos]] : null;
                const ok = checked && result ? result[pos] : null;
                return (
                  <div
                    key={pos}
                    onClick={() => filled && unplace(pos)}
                    className={`${s.row} ${filled && !checked ? s.rowClickable : ""}`}
                    title={filled && !checked ? "убрать" : undefined}
                  >
                    <span className={s.prompt}>{"›"}</span>
                    {filled ? (
                      <>
                        <span className={ok === null ? s.tokPending : ok ? s.tokOk : s.tokBad}>'{tok}'</span>
                        {checked && !ok && (
                          <span className={s.fixHint}>
                            → должно быть <span className={s.tokOk}>'{task.truth[pos]}'</span>
                          </span>
                        )}
                        {checked && ok && <span className={s.checkMark}>✓</span>}
                      </>
                    ) : pos === answer.length ? (
                      <span className={s.cursor} />
                    ) : (
                      <span className={s.placeholder}>·</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* действия */}
        {task && (
          <div className={s.actions}>
            {!checked ? (
              <>
                <button className={s.primary} onClick={check} disabled={!done}>
                  Проверить
                </button>
                <button className={s.btn} onClick={() => setAnswer([])} disabled={!answer.length}>
                  сбросить
                </button>
              </>
            ) : (
              <>
                <span className={`${s.verdict} ${win ? s.verdictWin : s.verdictLose}`}>
                  {win ? "✓ Верно!" : "✗ Не совсем"}
                </span>
                <button className={s.primary} onClick={() => newTask(level)}>
                  Следующая →
                </button>
                <button
                  className={`${s.btn} ${viz ? s.btnActive : ""}`}
                  onClick={() => setViz((v) => !v)}
                >
                  {viz ? "⏹ скрыть анимацию" : "▶ анимация event loop"}
                </button>
                <button className={s.btn} onClick={() => setReveal((r) => !r)}>
                  {reveal ? "скрыть разбор" : "разбор"}
                </button>
              </>
            )}
          </div>
        )}

        {/* анимация event loop */}
        {task && checked && viz && <EventLoopViz task={task} />}

        {/* разбор */}
        {task && checked && reveal && (
          <div className={s.reveal}>
            <div className={s.revealTitle}>ПОЧЕМУ ТАКОЙ ПОРЯДОК</div>
            {task.truth.map((tok, i) => {
              const ph = PHASES[task.phaseMap[tok]] || PHASES.sync;
              return (
                <div key={i} className={s.revealRow}>
                  <span className={s.revealNum}>{i + 1}.</span>
                  <span className={s.revealTok}>'{tok}'</span>
                  <span className={s.revealPhase}>{ph.name}</span>
                  <span className={s.revealHint}>{ph.hint}</span>
                </div>
              );
            })}
            <div className={s.rule}>
              Правило: <strong>синхронный код</strong> →{" "}
              <strong>все микрозадачи</strong> (Promise.then, queueMicrotask, код после await) →{" "}
              <strong>макрозадачи</strong> (setTimeout) по одной, и после каждой — снова все микрозадачи.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
