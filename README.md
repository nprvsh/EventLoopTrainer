# Event Loop Trainer ⟳

Тренажер по event loop в JavaScript: угадай, в каком порядке выполнятся `console.log`.

Задачи собираются случайно из готовых блоков (синхронный код, `setTimeout`, промисы, `async/await`, `queueMicrotask`) и **реально исполняются** в песочнице, чтобы получить эталонный порядок. После проверки доступны пошаговая анимация цикла событий (call stack, очереди микро- и макрозадач, консоль) и текстовый разбор.

## Уровни

- **Основы** — синхронный код, таймеры и простые микрозадачи.
- **Хардкор** — `async/await`, вложенность, цепочки и ловушки.
- **Собес** — монструозные задачи со злых собеседований.

## Запуск локально

```bash
npm install
npm run dev       # dev-сервер на http://localhost:5173
npm run build     # прод-сборка в dist/
npm run preview   # локальный просмотр прод-сборки
```

## Деплой на GitHub Pages

Деплой автоматический — через GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) при каждом пуше в `main`:

1. Создай репозиторий **EventLoopTrainer** на GitHub и запушь код в `main`.
2. В настройках репозитория: **Settings → Pages → Source → GitHub Actions**.
3. После завершения workflow сайт будет доступен на `https://<username>.github.io/EventLoopTrainer/`.

> Если репозиторий называется иначе, поменяй `base` в [vite.config.js](vite.config.js) на `/<имя-репозитория>/`.

## Структура проекта

```
├── .github/workflows/deploy.yml   # CI: сборка и деплой на Pages
├── index.html                     # входная HTML-страница
├── vite.config.js
└── src/
    ├── main.jsx                   # точка входа React
    ├── App.jsx / App.module.css   # главный экран тренажера
    ├── styles/
    │   └── global.css             # дизайн-токены (CSS-переменные) и базовые стили
    ├── data/
    │   ├── blocks.js              # блоки-генераторы кода задач
    │   ├── levels.js              # уровни сложности и пулы блоков
    │   └── phases.js              # фазы event loop + подсказки
    ├── lib/
    │   ├── generator.js           # сборка задачи и её реальное исполнение
    │   ├── sim.js                 # симуляция кадров для анимации
    │   └── random.js              # rnd / pick / shuffle
    └── components/
        ├── EventLoopViz.jsx|.module.css   # анимированная визуализация цикла событий
        └── highlight.jsx|.module.css      # подсветка синтаксиса
```

## Стек

React 18 + Vite 5, стили — CSS-модули + CSS-переменные, без сторонних UI-библиотек.
