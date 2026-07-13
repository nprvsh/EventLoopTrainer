import type { PropsWithChildren } from "react";

type VizZoneProps = PropsWithChildren & {
  title: string;
  tone: string;
  active: boolean;
  stack?: boolean;
  row?: boolean;
  queueZone?: "micro" | "macro";
  pendingLabel?: string;
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

export default function VizZone({ title, tone, active, children, stack = false, row = false, queueZone, pendingLabel, classNames }: VizZoneProps) {
  return (
    <div
      className={[classNames.zone, tone, stack ? classNames.stack : classNames.queue, active ? classNames.active : ""].join(" ")}
      data-queue-zone={queueZone}
      data-active={queueZone ? active : undefined}
    >
      <div className={classNames.title}>{title}</div>
      <div className={`${classNames.body} ${row ? classNames.row : ""}`} data-pending-label={pendingLabel}>{children}</div>
    </div>
  );
}
