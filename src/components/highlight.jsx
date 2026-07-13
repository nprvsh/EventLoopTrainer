import { T } from "../theme.js";

// ---------- подсветка синтаксиса ----------
const TOKEN_RE = /('[^']*')|(\/\/.*$)|\b(async|await|function|new|const|return|null)\b|\b(console|Promise|setTimeout|queueMicrotask)\b|\.(log|then|finally|resolve)\b|\b(\d+)\b|\b(run\d+)\b/g;

export function highlightLine(line, key) {
  if (!line.trim()) return <div key={key} style={{ height: "1.45em" }} />;
  const parts = [];
  let last = 0, m, i = 0;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(line)) !== null) {
    if (m.index > last) parts.push(<span key={i++}>{line.slice(last, m.index)}</span>);
    const [full, str, com, kw, glob, method, num, fn] = m;
    let color = T.text;
    if (str) color = T.str;
    else if (com) color = T.faint;
    else if (kw) color = T.kw;
    else if (glob) color = T.fn;
    else if (num) color = T.num;
    else if (fn) color = T.amber;
    if (method) {
      parts.push(<span key={i++}>.</span>);
      parts.push(<span key={i++} style={{ color: T.amber }}>{method}</span>);
    } else {
      parts.push(<span key={i++} style={{ color }}>{full}</span>);
    }
    last = m.index + full.length;
  }
  if (last < line.length) parts.push(<span key={i++}>{line.slice(last)}</span>);
  return <div key={key} style={{ whiteSpace: "pre", lineHeight: 1.45 }}>{parts}</div>;
}
