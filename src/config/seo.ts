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
    faqTitle: "Частые вопросы",
    faq: [
      {
        question: "Почему setTimeout с нулевой задержкой выполняется после Promise.then?",
        answer: "Колбэк setTimeout попадает в очередь макрозадач, а Promise.then — в очередь микрозадач. После синхронного кода движок сначала полностью разбирает микрозадачи и только потом берёт первую макрозадачу, поэтому даже setTimeout(fn, 0) сработает позже любого уже запланированного .then.",
      },
      {
        question: "Что выполняется раньше: микрозадачи или макрозадачи?",
        answer: "Микрозадачи. После каждой макрозадачи (и после синхронного кода) движок опустошает очередь микрозадач целиком, включая те, что были добавлены по ходу. Макрозадачи выполняются по одной за итерацию цикла событий.",
      },
      {
        question: "Что происходит с async-функцией после await?",
        answer: "На await функция приостанавливается и возвращает управление. Код после await оборачивается в микрозадачу: он выполнится, когда завершится синхронный код и подойдёт очередь микрозадач — даже если await применён к уже завершённому промису.",
      },
      {
        question: "Чем queueMicrotask отличается от setTimeout?",
        answer: "queueMicrotask ставит колбэк в очередь микрозадач — он выполнится сразу после текущего синхронного кода, до отрисовки и до любых таймеров. setTimeout ставит колбэк в очередь макрозадач, и он ждёт минимум одну итерацию цикла событий.",
      },
      {
        question: "Тренажёр бесплатный? Нужна ли регистрация?",
        answer: "Да, тренажёр полностью бесплатный и работает без регистрации. Задачи генерируются в браузере, прогресс сохраняется локально. Доступны три уровня сложности и темы: промисы, таймеры, async/await.",
      },
    ],
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
    faqTitle: "FAQ",
    faq: [
      {
        question: "Why does setTimeout with zero delay run after Promise.then?",
        answer: "A setTimeout callback goes to the macrotask queue, while Promise.then goes to the microtask queue. After synchronous code finishes, the engine drains all microtasks before picking the first macrotask, so even setTimeout(fn, 0) fires later than any already scheduled .then.",
      },
      {
        question: "Which run first: microtasks or macrotasks?",
        answer: "Microtasks. After every macrotask (and after synchronous code), the engine empties the entire microtask queue, including microtasks added along the way. Macrotasks run one per event loop iteration.",
      },
      {
        question: "What happens to an async function after await?",
        answer: "At await the function pauses and yields control. The code after await is wrapped in a microtask: it runs once synchronous code finishes and the microtask queue is processed — even if you await an already resolved promise.",
      },
      {
        question: "How is queueMicrotask different from setTimeout?",
        answer: "queueMicrotask puts a callback into the microtask queue — it runs right after the current synchronous code, before rendering and before any timers. setTimeout puts a callback into the macrotask queue, so it waits at least one event loop iteration.",
      },
      {
        question: "Is the trainer free? Do I need an account?",
        answer: "Yes, the trainer is completely free and requires no sign-up. Exercises are generated in the browser and your progress is stored locally. There are three difficulty levels and topics covering promises, timers, and async/await.",
      },
    ],
  },
} as const;
