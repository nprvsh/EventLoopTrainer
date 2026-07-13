import type { PropsWithChildren } from "react";

type VizZoneProps = PropsWithChildren & {
  title: string;
  tone: string;
  active: boolean;
  stack?: boolean;
  row?: boolean;
  classNames: {
    zone: string;
    stack: string;
    queue: string;
    active: string;
    title: string;
    body: string;
    row: string;
  };
}

export default function VizZone({ title, tone, active, children, stack = false, row = false, classNames }: VizZoneProps) {
  return (
    <div className={[classNames.zone, tone, stack ? classNames.stack : classNames.queue, active ? classNames.active : ""].join(" ")}>
      <div className={classNames.title}>{title}</div>
      <div className={`${classNames.body} ${row ? classNames.row : ""}`}>{children}</div>
    </div>
  );
}
