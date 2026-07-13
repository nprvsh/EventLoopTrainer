import { strings } from "@/config/strings";
import { LEVELS, THEMES } from "@/data";
import controls from "@/styles/controls.module.css";
import type { LevelKey, ThemeKey } from "@/types";
import s from "./LevelSelector.module.css";

type LevelSelectorProps = {
  level: LevelKey;
  theme: ThemeKey;
  onLevelChange: (level: LevelKey) => void;
  onThemeChange: (theme: ThemeKey) => void;
  onNewTask: () => void;
}

export default function LevelSelector({ level, theme, onLevelChange, onThemeChange, onNewTask }: LevelSelectorProps) {
  const currentLevel = LEVELS[level];

  return (
    <div className={s.levels}>
      <div className={s.section}>
        <span className={s.label}>{strings.levelSelector.level}</span>
        <div className={s.group} aria-label={strings.levelSelector.level}>
          {Object.entries(LEVELS).map(([key, config]) => (
            <button key={key} className={`${controls.btn} ${level === key ? controls.btnActive : ""}`} onClick={() => onLevelChange(key as LevelKey)} title={config.desc}>
              {config.title}
            </button>
          ))}
        </div>
      </div>
      <div className={s.section}>
        <span className={s.label}>{strings.levelSelector.theme}</span>
        <div className={s.group} aria-label={strings.levelSelector.taskThemeAriaLabel}>
          {Object.entries(THEMES).map(([key, config]) => {
            const available = !config.blocks || currentLevel.pool.some((block: string) => config.blocks.includes(block));
            return (
              <button
                key={key}
                className={`${controls.btn} ${theme === key ? controls.btnActive : ""}`}
                disabled={!available}
                onClick={() => onThemeChange(key as ThemeKey)}
                title={available ? strings.levelSelector.themeTitle(config.title) : strings.levelSelector.unavailableThemeTitle}
              >
                {config.title}
              </button>
            );
          })}
        </div>
      </div>
      <button className={`${controls.btn} ${s.pushRight}`} onClick={onNewTask}>{strings.levelSelector.newTask}</button>
    </div>
  );
}
