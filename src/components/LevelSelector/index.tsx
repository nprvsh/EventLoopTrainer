import { useStrings } from "@/config/strings";
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
  const strings = useStrings();
  const currentLevel = LEVELS[level];

  return (
    <div className={s.levels}>
      <div className={s.section}>
        <span className={s.label}>{strings.levelSelector.level}</span>
        <div className={s.group} aria-label={strings.levelSelector.level}>
          {Object.keys(LEVELS).map((key) => (
            <button key={key} className={`${controls.btn} ${level === key ? controls.btnActive : ""}`} onClick={() => onLevelChange(key as LevelKey)} title={strings.levels[key as LevelKey].description}>
              {strings.levels[key as LevelKey].label}
            </button>
          ))}
        </div>
      </div>
      <div className={s.section}>
        <span className={s.label}>{strings.levelSelector.theme}</span>
        <div className={s.group} aria-label={strings.levelSelector.taskThemeAriaLabel}>
          {Object.entries(THEMES).map(([key, config]) => {
            const themeBlocks = config.blocks;
            const available = !themeBlocks || currentLevel.pool.some((block) => themeBlocks.includes(block));
            return (
              <button
                key={key}
                className={`${controls.btn} ${theme === key ? controls.btnActive : ""}`}
                disabled={!available}
                onClick={() => onThemeChange(key as ThemeKey)}
                title={available ? strings.levelSelector.themeTitle(strings.themes[key as ThemeKey]) : strings.levelSelector.unavailableThemeTitle}
              >
                {strings.themes[key as ThemeKey]}
              </button>
            );
          })}
        </div>
      </div>
      <button className={`${controls.btn} ${s.pushRight}`} onClick={onNewTask}>{strings.levelSelector.newTask}</button>
    </div>
  );
}
