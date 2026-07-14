import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import s from "./AutoHeight.module.css";

type AutoHeightProps = {
  children: ReactNode;
  className?: string;
};

export default function AutoHeight({ children, className }: AutoHeightProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const updateHeight = () => setHeight(content.getBoundingClientRect().height);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`${s.container} ${className ?? ""}`} style={{ height }}>
      <div ref={contentRef} className={s.content}>
        {children}
      </div>
    </div>
  );
}
