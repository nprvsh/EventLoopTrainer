import type { ColorModeKey, ColorThemeKey, Stats } from "@/types";
import s from "./TrainerHeader.module.css";

type TrainerHeaderProps = {
  stats: Stats;
  colorTheme: ColorThemeKey;
  colorMode: ColorModeKey;
  onColorThemeChange: (theme: ColorThemeKey) => void;
  onColorModeChange: (mode: ColorModeKey) => void;
}

const colorThemeOptions: { key: ColorThemeKey; label: string }[] = [
  { key: "midnight", label: "Ночной" },
  { key: "ocean", label: "Океан" },
  { key: "forest", label: "Лес" },
  { key: "rose", label: "Роза" },
];

export default function TrainerHeader({ stats, colorTheme, colorMode, onColorThemeChange, onColorModeChange }: TrainerHeaderProps) {
  return (
    <div className={s.header}>
      <div>
        <div className={s.kicker}>event loop · тренажер</div>
        <h1 className={s.title}>В каком порядке <span className={s.titleFn}>console</span><span>.</span><span className={s.titleAmber}>log</span>?</h1>
      </div>
      <div className={s.meta}>
        <div className={s.appearanceControls}>
          <div className={s.modePicker} aria-label="Режим оформления">
            <button
              type="button"
              className={`${s.modeButton} ${colorMode === "light" ? s.modeButtonActive : ""}`}
              aria-label="Светлая тема"
              aria-pressed={colorMode === "light"}
              title="Светлая тема"
              onClick={() => onColorModeChange("light")}
            >
              Светлая
            </button>
            <button
              type="button"
              className={`${s.modeButton} ${colorMode === "dark" ? s.modeButtonActive : ""}`}
              aria-label="Тёмная тема"
              aria-pressed={colorMode === "dark"}
              title="Тёмная тема"
              onClick={() => onColorModeChange("dark")}
            >
              Тёмная
            </button>
          </div>
          <div className={s.themePicker} aria-label="Цветовая схема">
            {colorThemeOptions.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`${s.themeButton} ${colorTheme === key ? s.themeButtonActive : ""}`}
                aria-label={`Цветовая схема: ${label}`}
                aria-pressed={colorTheme === key}
                title={label}
                onClick={() => onColorThemeChange(key)}
              >
                <span className={`${s.themeDot} ${s[`themeDot${key[0].toUpperCase()}${key.slice(1)}`]}`} />
              </button>
            ))}
          </div>
        </div>
        <div className={s.stats}>серия <span className={stats.streak > 0 ? s.statAccent : undefined}>{stats.streak}</span>{" · "}рекорд <span className={s.statText}>{stats.best}</span>{" · "}решено {stats.solved}/{stats.total}</div>
      </div>
    </div>
  );
}
