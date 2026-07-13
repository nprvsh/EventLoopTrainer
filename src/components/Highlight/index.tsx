import type { ReactNode } from "react";
import s from "./highlight.module.css";

const TOKEN_RE = /('[^']*')|(\/\/.*$)|\b(async|await|function|new|const|return|null)\b|\b(console|Promise|setTimeout|queueMicrotask)\b|\.(log|then|finally|resolve)\b|\b(\d+)\b|\b(run\d+)\b/g;

export function highlightLine(line: string, key: number, className?: string): ReactNode {
  if (!line.trim()) return <div key={key} className={`${s.blank} ${className ?? ""}`} />;

  const parts: ReactNode[] = [];
  let last = 0;
  let index = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;

  while ((match = TOKEN_RE.exec(line)) !== null) {
    if (match.index > last) parts.push(<span key={index++}>{line.slice(last, match.index)}</span>);
    const [full, stringLiteral, comment, keyword, global, method, number, functionName] = match;
    const className = stringLiteral ? s.str : comment ? s.com : keyword ? s.kw : global ? s.glob : number ? s.num : functionName ? s.fnName : undefined;
    if (method) {
      parts.push(<span key={index++}>.</span>, <span key={index++} className={s.method}>{method}</span>);
    } else {
      parts.push(<span key={index++} className={className}>{full}</span>);
    }
    last = match.index + full.length;
  }

  if (last < line.length) parts.push(<span key={index++}>{line.slice(last)}</span>);
  return <div key={key} className={`${s.line} ${className ?? ""}`}>{parts}</div>;
}
