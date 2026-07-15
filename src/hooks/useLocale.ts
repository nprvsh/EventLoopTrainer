import { useEffect, useState } from "react";
import { seoContent } from "@/config/seo";
import type { LocaleKey } from "@/types";

const STORAGE_KEY = "event-loop-trainer:locale";
const SITE_ORIGIN = "https://eventloop.lol";

// Локаль привязана к URL (/ — ru, /en/ — en): у каждой языковой версии свой
// пререндеренный HTML с canonical и hreflang, см. index.html и en/index.html.
export function useLocale() {
  const [locale, setLocale] = useState<LocaleKey>(() => {
    // Ссылка на /en/ должна открывать английскую версию независимо от сохранённых настроек.
    if (window.location.pathname.startsWith("/en")) return "en";
    const savedLocale = localStorage.getItem(STORAGE_KEY);
    if (savedLocale === "ru" || savedLocale === "en") return savedLocale;
    return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(STORAGE_KEY, locale);

    const metadata = seoContent[locale];
    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", metadata.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", metadata.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", metadata.description);
    document.querySelector('meta[property="og:locale"]')?.setAttribute("content", metadata.ogLocale);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", metadata.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", metadata.description);

    const localePath = locale === "en" ? "/en/" : "/";
    if (window.location.pathname !== localePath) window.history.replaceState(null, "", localePath);
    const localeUrl = `${SITE_ORIGIN}${localePath}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", localeUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", localeUrl);
  }, [locale]);

  return [locale, setLocale] as const;
}
