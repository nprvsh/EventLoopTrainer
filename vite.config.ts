import { defineConfig } from "vite";
import type { Plugin } from "vite";
import { fileURLToPath, URL } from "node:url";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { seoContent } from "./src/config/seo";
import type { LocaleKey } from "./src/types";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// FAQPage JSON-LD генерируется из src/config/seo.ts, чтобы разметка для
// поисковиков не расходилась с FAQ-блоком, который рендерит приложение.
const faqJsonLd = (locale: LocaleKey) =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seoContent[locale].faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });

const faqJsonLdPlugin = (): Plugin => ({
  name: "faq-jsonld",
  transformIndexHtml: {
    order: "pre",
    handler(html, ctx) {
      const relativePage = path.relative(rootDir, ctx.filename).replace(/\\/g, "/");
      const locale: LocaleKey = relativePage.startsWith("en/") ? "en" : "ru";
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: { type: "application/ld+json" },
            children: faqJsonLd(locale),
            injectTo: "head",
          },
        ],
      };
    },
  },
});

// Сайт опубликован в корне собственного домена: https://eventloop.lol/
export default defineConfig({
  plugins: [react(), faqJsonLdPlugin()],
  base: "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        en: fileURLToPath(new URL("./en/index.html", import.meta.url)),
      },
    },
  },
});
