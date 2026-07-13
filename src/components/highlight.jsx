import s from "./highlight.module.css";

// ---------- подсветка синтаксиса ----------
const TOKEN_RE = /('[^']*')|(\/\/.*$)|\b(async|await|function|new|const|return|null)\b|\b(console|Promise|setTimeout|queueMicrotask)\b|\.(log|then|finally|resolve)\b|\b(\d+)\b|\b(run\d+)\b/g;

export function highlightLine(line, key) {
  if (!line.trim()) return <div key={key} className={s.blank} />;
  const parts = [];
  let last = 0, m, i = 0;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(line)) !== null) {
    if (m.index > last) parts.push(<span key={i++}>{line.slice(last, m.index)}</span>);
    const [full, str, com, kw, glob, method, num, fn] = m;
    let cls;
    if (str) cls = s.str;
    else if (com) cls = s.com;
    else if (kw) cls = s.kw;
    else if (glob) cls = s.glob;
    else if (num) cls = s.num;
    else if (fn) cls = s.fnName;
    if (method) {
      parts.push(<span key={i++}>.</span>);
      parts.push(<span key={i++} className={s.method}>{method}</span>);
    } else {
      parts.push(<span key={i++} className={cls}>{full}</span>);
    }
    last = m.index + full.length;
  }
  if (last < line.length) parts.push(<span key={i++}>{line.slice(last)}</span>);
  return <div key={key} className={s.line}>{parts}</div>;
}
