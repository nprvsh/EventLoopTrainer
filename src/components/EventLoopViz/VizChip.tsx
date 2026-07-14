import type { AnimationEventHandler, PropsWithChildren } from "react";

type VizChipProps = PropsWithChildren & {
  tone: string;
  wide?: boolean;
  className: string;
  wideClassName: string;
  onAnimationEnd?: AnimationEventHandler<HTMLSpanElement>;
}

export default function VizChip({ children, tone, wide = false, className, wideClassName, onAnimationEnd }: VizChipProps) {
  return (
    <span className={[className, tone, wide ? wideClassName : ""].join(" ")} onAnimationEnd={onAnimationEnd}>
      {children}
    </span>
  );
}
