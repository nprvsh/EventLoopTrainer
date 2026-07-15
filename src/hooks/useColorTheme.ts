import { useEffect, useState } from "react";
import type { ColorThemeKey } from "@/types";

const STORAGE_KEY = "event-loop-trainer:color-theme";

export const colorThemes: ColorThemeKey[] = ["midnight", "ocean", "forest", "rose"];

// Значения продублированы в инлайн-скрипте index.html (для рендера без FOUC).
const themeColors: Record<ColorThemeKey, string> = {
  midnight: "#14161F",
  ocean: "#071923",
  forest: "#101A14",
  rose: "#20131E",
};

export function useColorTheme() {
  const [colorTheme, setColorTheme] = useState<ColorThemeKey>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return colorThemes.includes(savedTheme as ColorThemeKey) ? savedTheme as ColorThemeKey : "midnight";
  });

  useEffect(() => {
    document.documentElement.dataset.colorTheme = colorTheme;
    document.documentElement.style.colorScheme = "dark";
    localStorage.setItem(STORAGE_KEY, colorTheme);

    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute("content", themeColors[colorTheme]);
  }, [colorTheme]);

  return [colorTheme, setColorTheme] as const;
}
