import { useState, useEffect, useCallback, useRef } from "react";
import { T } from "./theme.js";
import { PHASES } from "./data/phases.js";
import { LEVELS } from "./data/levels.js";
import { generateTask } from "./lib/generator.js";
import { highlightLine } from "./components/highlight.jsx";
import EventLoopViz from "./components/EventLoopViz.jsx";

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
    setStats((s) => {
      const streak = win ? s.streak + 1 : 0;
      return {
        streak,
        best: Math.max(s.best, streak),
        solved: s.solved + (win ? 1 : 0),
        total: s.total + 1,
      };
    });
  };

  const usedIdx = new Set(answer);
  const done = task && answer.length === task.truth.length;
  const win = checked && result && result.every(Boolean);

  const btn = (active) => ({
    fontFamily: T.mono,
    fontSize: 13,
    padding: "7px 14px",
    borderRadius: 8,
    border: `1px solid ${active ? T.amber : T.panelEdge}`,
    background: active ? "rgba(255,198,109,0.12)" : "transparent",
    color: active ? T.amber : T.dim,
    cursor: "pointer",
  });

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, color: T.text,
      fontFamily: T.mono, padding: "28px 16px 60px",
    }}>
      <style>{`
        @keyframes blink { 0%,55% {opacity:1} 56%,100% {opacity:0} }
        @keyframes vpop { from { opacity: 0; transform: translateY(6px) scale(.92); } to { opacity: 1; transform: none; } }
        @keyframes vfade { from { opacity: 0; } to { opacity: 1; } }
        .vchip { animation: vpop .35s ease both; }
        .vnote { animation: vfade .4s ease both; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
        .chip:hover:not(:disabled) { border-color: ${T.amber} !important; color: ${T.amber} !important; }
        .outline-btn:hover:not(:disabled) { border-color: ${T.dim} !important; color: ${T.text} !important; }
      `}</style>

      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* шапка */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, color: T.faint, textTransform: "uppercase" }}>event loop · тренажер</div>
            <h1 style={{ fontSize: 22, margin: "6px 0 0", fontWeight: 600 }}>
              В каком порядке <span style={{ color: T.fn }}>console</span><span>.</span><span style={{ color: T.amber }}>log</span>?
            </h1>
          </div>
          <div style={{ fontSize: 12, color: T.dim, textAlign: "right", lineHeight: 1.7 }}>
            серия <span style={{ color: stats.streak > 0 ? T.amber : T.dim }}>{stats.streak}</span>
            {" · "}рекорд <span style={{ color: T.text }}>{stats.best}</span>
            {" · "}решено {stats.solved}/{stats.total}
          </div>
        </div>

        {/* уровни */}
        <div style={{ display: "flex", gap: 8, margin: "18px 0 14px", flexWrap: "wrap" }}>
          {Object.entries(LEVELS).map(([k, v]) => (
            <button key={k} style={btn(level === k)} onClick={() => setLevel(k)} title={v.desc}>
              {v.title}
            </button>
          ))}
          <button
            className="outline-btn"
            style={{ ...btn(false), marginLeft: "auto" }}
            onClick={() => newTask(level)}
          >
            ↻ новая задача
          </button>
        </div>

        {/* код */}
        <div style={{
          background: T.panel, border: `1px solid ${T.panelEdge}`, borderRadius: 12,
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
            borderBottom: `1px solid ${T.panelEdge}`, fontSize: 11, color: T.faint,
          }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#3A4157" }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#3A4157" }} />
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#3A4157" }} />
            <span style={{ marginLeft: 6 }}>task.js</span>
          </div>
          <div style={{ padding: "16px 18px", fontSize: 13.5, overflowX: "auto" }}>
            {task
              ? task.lines.map((l, i) => highlightLine(l, i))
              : <div style={{ color: T.faint }}>// собираю задачу…</div>}
          </div>
        </div>

        {/* фишки-варианты */}
        {task && (
          <div style={{ margin: "16px 0 8px" }}>
            <div style={{ fontSize: 11, color: T.faint, marginBottom: 8, letterSpacing: 1 }}>
              НАЖИМАЙ В ТОМ ПОРЯДКЕ, В КОТОРОМ ПОЯВИТСЯ ВЫВОД
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {task.tokens.map((tok, i) => (
                <button
                  key={i}
                  className="chip"
                  disabled={usedIdx.has(i) || checked}
                  onClick={() => place(i)}
                  style={{
                    fontFamily: T.mono, fontSize: 15, fontWeight: 600,
                    minWidth: 44, padding: "9px 0", borderRadius: 9,
                    border: `1px solid ${T.panelEdge}`,
                    background: T.panel,
                    color: usedIdx.has(i) ? T.faint : T.text,
                    opacity: usedIdx.has(i) ? 0.35 : 1,
                    cursor: usedIdx.has(i) || checked ? "default" : "pointer",
                  }}
                >
                  '{tok}'
                </button>
              ))}
            </div>
          </div>
        )}

        {/* консоль — сюда «пишется» ответ */}
        {task && (
          <div style={{
            background: T.console, border: `1px solid ${T.panelEdge}`,
            borderRadius: 12, marginTop: 14, overflow: "hidden",
          }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.panelEdge}`, fontSize: 11, color: T.faint }}>
              Console — твой прогноз
            </div>
            <div style={{ padding: "12px 16px", fontSize: 13.5, minHeight: 40 }}>
              {task.truth.map((_, pos) => {
                const filled = pos < answer.length;
                const tok = filled ? task.tokens[answer[pos]] : null;
                const ok = checked && result ? result[pos] : null;
                return (
                  <div
                    key={pos}
                    onClick={() => filled && unplace(pos)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "3px 0", lineHeight: 1.5,
                      cursor: filled && !checked ? "pointer" : "default",
                    }}
                    title={filled && !checked ? "убрать" : undefined}
                  >
                    <span style={{ color: T.faint }}>{"›"}</span>
                    {filled ? (
                      <>
                        <span style={{ color: ok === null ? T.str : ok ? T.good : T.bad }}>'{tok}'</span>
                        {checked && !ok && (
                          <span style={{ color: T.faint, fontSize: 12 }}>
                            → должно быть <span style={{ color: T.good }}>'{task.truth[pos]}'</span>
                          </span>
                        )}
                        {checked && ok && <span style={{ color: T.good, fontSize: 12 }}>✓</span>}
                      </>
                    ) : pos === answer.length ? (
                      <span style={{
                        display: "inline-block", width: 8, height: 16,
                        background: T.amber, animation: "blink 1.1s step-end infinite",
                      }} />
                    ) : (
                      <span style={{ color: "#2B3044" }}>·</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* действия */}
        {task && (
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
            {!checked ? (
              <>
                <button
                  onClick={check}
                  disabled={!done}
                  style={{
                    fontFamily: T.mono, fontSize: 14, fontWeight: 600,
                    padding: "10px 22px", borderRadius: 9, border: "none",
                    background: done ? T.amber : "#2A2F42",
                    color: done ? "#1A1409" : T.faint,
                    cursor: done ? "pointer" : "default",
                  }}
                >
                  Проверить
                </button>
                <button className="outline-btn" style={btn(false)} onClick={() => setAnswer([])} disabled={!answer.length}>
                  сбросить
                </button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 15, fontWeight: 600, color: win ? T.good : T.bad }}>
                  {win ? "✓ Верно!" : "✗ Не совсем"}
                </span>
                <button
                  onClick={() => newTask(level)}
                  style={{
                    fontFamily: T.mono, fontSize: 14, fontWeight: 600,
                    padding: "10px 22px", borderRadius: 9, border: "none",
                    background: T.amber, color: "#1A1409", cursor: "pointer",
                  }}
                >
                  Следующая →
                </button>
                <button
                  className="outline-btn"
                  style={btn(viz)}
                  onClick={() => setViz((v) => !v)}
                >
                  {viz ? "⏹ скрыть анимацию" : "▶ анимация event loop"}
                </button>
                <button className="outline-btn" style={btn(false)} onClick={() => setReveal((r) => !r)}>
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
          <div style={{
            marginTop: 16, background: T.panel, border: `1px solid ${T.panelEdge}`,
            borderRadius: 12, padding: "14px 18px", fontSize: 13,
          }}>
            <div style={{ fontSize: 11, color: T.faint, letterSpacing: 1, marginBottom: 10 }}>ПОЧЕМУ ТАКОЙ ПОРЯДОК</div>
            {task.truth.map((tok, i) => {
              const ph = PHASES[task.phaseMap[tok]] || PHASES.sync;
              return (
                <div key={i} style={{ display: "flex", gap: 12, padding: "5px 0", alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ color: T.faint, minWidth: 18 }}>{i + 1}.</span>
                  <span style={{ color: T.str, minWidth: 34, fontWeight: 600 }}>'{tok}'</span>
                  <span style={{ color: T.amber, minWidth: 150 }}>{ph.name}</span>
                  <span style={{ color: T.dim }}>{ph.hint}</span>
                </div>
              );
            })}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.panelEdge}`, color: T.dim, lineHeight: 1.6 }}>
              Правило: <span style={{ color: T.text }}>синхронный код</span> →{" "}
              <span style={{ color: T.text }}>все микрозадачи</span> (Promise.then, queueMicrotask, код после await) →{" "}
              <span style={{ color: T.text }}>макрозадачи</span> (setTimeout) по одной, и после каждой — снова все микрозадачи.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
