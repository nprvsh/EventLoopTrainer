import { useState, useEffect, useMemo } from "react";
import { T } from "../theme.js";
import { buildSim } from "../lib/sim.js";

// ---------- визуализация event loop ----------
function VizZone({ title, color, active, children, minH = 54, row = false }) {
  return (
    <div style={{
      border: `1px solid ${active ? color : T.panelEdge}`,
      boxShadow: active ? `0 0 0 1px ${color}55, 0 0 18px ${color}22` : "none",
      borderRadius: 10, padding: "8px 10px", minHeight: minH,
      transition: "border-color .3s, box-shadow .3s",
      flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, color: active ? color : T.faint, marginBottom: 6, textTransform: "uppercase", transition: "color .3s" }}>
        {title}
      </div>
      <div style={{
        display: "flex", gap: 6, flexWrap: "wrap",
        flexDirection: row ? "row" : "column", alignItems: row ? "center" : "stretch",
      }}>
        {children}
      </div>
    </div>
  );
}

function VizChip({ children, color, wide }) {
  return (
    <span className="vchip" style={{
      fontSize: 12, fontWeight: 600, color,
      border: `1px solid ${color}66`, background: `${color}14`,
      borderRadius: 7, padding: "4px 9px",
      whiteSpace: "nowrap", alignSelf: wide ? "stretch" : undefined,
      textAlign: "center",
    }}>
      {children}
    </span>
  );
}

export default function EventLoopViz({ task }) {
  const steps = useMemo(() => buildSim(task), [task]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => { setI(0); setPlaying(true); }, [steps]);

  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setI((x) => x + 1), 1700);
    return () => clearTimeout(t);
  }, [playing, i, steps]);

  const s = steps[i];
  const gname = (gid) => gid; // gid = первая метка группы

  const ctrl = {
    fontFamily: T.mono, fontSize: 13, width: 34, height: 30,
    borderRadius: 7, border: `1px solid ${T.panelEdge}`,
    background: "transparent", color: T.dim, cursor: "pointer",
  };

  return (
    <div style={{
      marginTop: 16, background: T.panel, border: `1px solid ${T.panelEdge}`,
      borderRadius: 12, padding: "14px 16px",
    }}>
      {/* подпись шага + управление */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <button className="outline-btn" style={ctrl} onClick={() => { setPlaying(false); setI((x) => Math.max(0, x - 1)); }}>‹</button>
        <button
          className="outline-btn"
          style={{ ...ctrl, color: T.amber, borderColor: `${T.amber}66` }}
          onClick={() => {
            if (i >= steps.length - 1) { setI(0); setPlaying(true); }
            else setPlaying((p) => !p);
          }}
        >
          {playing ? "❚❚" : i >= steps.length - 1 ? "↻" : "▶"}
        </button>
        <button className="outline-btn" style={ctrl} onClick={() => { setPlaying(false); setI((x) => Math.min(steps.length - 1, x + 1)); }}>›</button>
        <span style={{ fontSize: 11, color: T.faint }}>{i + 1}/{steps.length}</span>
        <span key={i} className="vnote" style={{ fontSize: 12.5, color: T.text, flexBasis: "100%", minHeight: 18 }}>
          {s.note}
        </span>
      </div>

      {/* прогресс */}
      <div style={{ height: 3, background: "#242938", borderRadius: 2, marginBottom: 14, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${((i + 1) / steps.length) * 100}%`,
          background: T.amber, transition: "width .4s", borderRadius: 2,
        }} />
      </div>

      {/* схема */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <VizZone title="Call Stack" color={T.amber} active={s.hl === "stack"} minH={80}>
          {s.stack.length
            ? s.stack.map((f) => <VizChip key={f} color={T.amber} wide>{f}</VizChip>)
            : <span style={{ fontSize: 11, color: "#2E3348" }}>пусто</span>}
        </VizZone>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1.4, minWidth: 220 }}>
          <VizZone title="Microtask Queue" color={T.kw} active={s.hl === "micro"} minH={44} row>
            {s.micro.length
              ? s.micro.map((g) => <VizChip key={g} color={T.kw}>{gname(g)}</VizChip>)
              : <span style={{ fontSize: 11, color: "#2E3348" }}>—</span>}
          </VizZone>
          <VizZone title="Task Queue (setTimeout)" color={T.num} active={s.hl === "macro"} minH={44} row>
            {s.macro.length
              ? s.macro.map((g) => <VizChip key={g} color={T.num}>{gname(g)}</VizChip>)
              : <span style={{ fontSize: 11, color: "#2E3348" }}>—</span>}
          </VizZone>
        </div>
      </div>

      {/* консоль */}
      <div style={{
        marginTop: 10, background: T.console, borderRadius: 10,
        border: `1px solid ${s.hl === "out" ? T.good + "88" : T.panelEdge}`,
        transition: "border-color .3s",
        padding: "8px 12px", minHeight: 36,
        display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 10, letterSpacing: 1.2, color: T.faint }}>CONSOLE</span>
        {s.out.map((l) => (
          <span key={l} className="vchip" style={{ fontSize: 13, color: T.str }}>'{l}'</span>
        ))}
        {!s.out.length && <span style={{ fontSize: 11, color: "#2E3348" }}>вывода пока нет</span>}
      </div>
    </div>
  );
}
