import { useStrings } from "@/config/strings";
import type { ColorThemeKey, LocaleKey, Stats } from "@/types";
import s from "./TrainerHeader.module.css";

type TrainerHeaderProps = {
  stats: Stats;
  colorTheme: ColorThemeKey;
  onColorThemeChange: (theme: ColorThemeKey) => void;
  locale: LocaleKey;
  onLocaleChange: (locale: LocaleKey) => void;
}

export default function TrainerHeader({ stats, colorTheme, onColorThemeChange, locale, onLocaleChange }: TrainerHeaderProps) {
  const strings = useStrings();
  const colorThemeOptions: { key: ColorThemeKey; label: string }[] = [
    { key: "midnight", label: strings.header.colorThemes.midnight },
    { key: "ocean", label: strings.header.colorThemes.ocean },
    { key: "forest", label: strings.header.colorThemes.forest },
    { key: "rose", label: strings.header.colorThemes.rose },
  ];

  return (
    <header className={s.header}>
      <div>
        <div className={s.kicker}>{strings.header.kicker}</div>
        <h1 className={s.title}>{strings.header.titleBeforeConsole}<span className={s.titleFn}>console</span><span>.</span><span className={s.titleAmber}>log</span>?</h1>
      </div>
      <div className={s.meta}>
        <div className={s.appearanceControls}>
          <div className={s.languagePicker} aria-label={strings.header.languageAriaLabel}>
            {(["ru", "en"] as const).map((language) => (
              <button
                key={language}
                type="button"
                className={`${s.languageButton} ${locale === language ? s.languageButtonActive : ""}`}
                aria-pressed={locale === language}
                onClick={() => onLocaleChange(language)}
              >
                {language.toUpperCase()}
              </button>
            ))}
          </div>
          <div className={s.themePicker} aria-label={strings.header.colorThemeAriaLabel}>
            {colorThemeOptions.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`${s.themeButton} ${colorTheme === key ? s.themeButtonActive : ""}`}
                aria-label={strings.header.colorThemeAriaLabelWithName(label)}
                aria-pressed={colorTheme === key}
                title={label}
                onClick={() => onColorThemeChange(key)}
              >
                <span className={`${s.themeDot} ${s[`themeDot${key[0].toUpperCase()}${key.slice(1)}`]}`} />
              </button>
            ))}
          </div>
        </div>
        <div className={s.stats}>{strings.header.streak} <span className={stats.streak > 0 ? s.statAccent : undefined}>{stats.streak}</span>{" · "}{strings.header.record} <span className={s.statText}>{stats.best}</span>{" · "}{strings.header.solved} {stats.solved}/{stats.total}</div>
      </div>
    </header>
  );
}
