import { LEVELS } from "@/data";
import controls from "@/styles/controls.module.css";
import type { LevelKey } from "@/types";
import s from "./LevelSelector.module.css";

interface LevelSelectorProps {
  level: LevelKey;
  onLevelChange: (level: LevelKey) => void;
  onNewTask: () => void;
}

export default function LevelSelector({ level, onLevelChange, onNewTask }: LevelSelectorProps) {
  return (
    <div className={s.levels}>
      {Object.entries(LEVELS).map(([key, config]) => (
        <button key={key} className={`${controls.btn} ${level === key ? controls.btnActive : ""}`} onClick={() => onLevelChange(key as LevelKey)} title={config.desc}>
          {config.title}
        </button>
      ))}
      <button className={`${controls.btn} ${s.pushRight}`} onClick={onNewTask}>↻ новая задача</button>
    </div>
  );
}
