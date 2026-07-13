import type { PropsWithChildren } from "react";

type VizChipProps = PropsWithChildren & {
  tone: string;
  wide?: boolean;
  className: string;
  wideClassName: string;
}

export default function VizChip({ children, tone, wide = false, className, wideClassName }: VizChipProps) {
  return <span className={[className, tone, wide ? wideClassName : ""].join(" ")}>{children}</span>;
}
