export const seoContent = {
  ru: {
    title: "JavaScript Event Loop Trainer — микрозадачи, таймеры, async/await",
    description: "Интерактивный тренажёр JavaScript Event Loop: синхронный код, микрозадачи, таймеры и async/await. Предсказывайте порядок console.log и изучайте визуализацию очередей.",
    ogLocale: "ru_RU",
    heading: "Как работает JavaScript Event Loop",
    intro: "Почему setTimeout с нулевой задержкой всё равно срабатывает позже, чем Promise.then? Про это можно прочитать десять статей и всё равно путаться — куда проще один раз потыкать руками. Смотрите на кусок кода, прикидываете, в каком порядке выведутся console.log, а потом сверяетесь с разбором. Ну и анимация в помощь: на ней видно, как строки бегают через стек и очереди.",
    conceptsTitle: "Что здесь тренируется",
    concepts: [
      "Синхронный код и Call Stack",
      "Микрозадачи: Promise.then, Promise.finally, queueMicrotask",
      "Макрозадачи: setTimeout и вложенные таймеры",
      "Что происходит с async-функцией после await",
    ],
    ruleTitle: "Главное правило",
    rule: "Сначала до конца выполняется весь синхронный код. Потом движок разбирает очередь микрозадач — целиком, до последней. И только после этого берёт одну задачу из очереди таймеров, после которой снова проверяет микрозадачи. И так по кругу.",
  },
  en: {
    title: "JavaScript Event Loop Trainer — microtasks, timers, async/await",
    description: "An interactive JavaScript Event Loop trainer for synchronous code, microtasks, timers, and async/await. Predict console.log output and explore the queues visually.",
    ogLocale: "en_US",
    heading: "How the JavaScript Event Loop works",
    intro: "Why does a zero-delay setTimeout fire after Promise.then? Things like that are easier to figure out hands-on than to memorize from articles. You get a snippet of code — arrange the console.log lines in the order they actually print, then check the explanation and watch the animation to see each line move through the stack and the queues.",
    conceptsTitle: "What you'll practice",
    concepts: [
      "Synchronous code and the Call Stack",
      "Microtasks: Promise.then, Promise.finally, queueMicrotask",
      "Macrotasks: setTimeout and nested timers",
      "What happens to an async function after await",
    ],
    ruleTitle: "The key rule",
    rule: "Synchronous code runs to completion first. Then the engine drains the microtask queue — all of it. Only then does it pick one task from the timer queue, check microtasks again, and repeat.",
  },
} as const;
