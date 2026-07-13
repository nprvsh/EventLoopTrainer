import type { Stats } from "@/types";
import s from "./TrainerHeader.module.css";

interface TrainerHeaderProps {
  stats: Stats;
}

export default function TrainerHeader({ stats }: TrainerHeaderProps) {
  return (
    <div className={s.header}>
      <div><div className={s.kicker}>event loop · тренажер</div><h1 className={s.title}>В каком порядке <span className={s.titleFn}>console</span><span>.</span><span className={s.titleAmber}>log</span>?</h1></div>
      <div className={s.stats}>серия <span className={stats.streak > 0 ? s.statAccent : undefined}>{stats.streak}</span>{" · "}рекорд <span className={s.statText}>{stats.best}</span>{" · "}решено {stats.solved}/{stats.total}</div>
    </div>
  );
}
