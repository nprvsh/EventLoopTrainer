import { describe, expect, it } from "vitest";
import { localizedStrings } from "@/config/strings";
import { generateTask } from "@/lib/generator";
import type { Task } from "@/types";
import { buildSim } from ".";

const strings = localizedStrings.en.sim;

// Фикстура: детерминированная задача из sync + микрозадачи + таймера с вложенной микрозадачей.
const fixtureTask: Task = {
  lines: [
    "console.log('A');",
    "Promise.resolve().then(() => console.log('B'));",
    "setTimeout(() => {",
    "  console.log('C');",
    "  Promise.resolve().then(() => console.log('D'));",
    "}, 0);",
  ],
  truth: ["A", "B", "C", "D"],
  phaseMap: { A: "sync", B: "micro", C: "macro", D: "microInMacro" },
  logs: [
    { label: "A", phase: "sync" },
    { label: "B", phase: "micro" },
    { label: "C", phase: "macro" },
    { label: "D", phase: "microInMacro", parent: "C", rel: "micro" },
  ],
  tokens: ["C", "A", "D", "B"],
};

describe("buildSim", () => {
  it("starts with the script phase and ends with empty queues", () => {
    const steps = buildSim(fixtureTask, strings);

    expect(steps[0].note).toBe(strings.scriptStart);
    expect(steps[0].stack).toEqual(["script"]);

    const finalStep = steps[steps.length - 1];
    expect(finalStep.note).toBe(strings.complete);
    expect(finalStep.stack).toEqual([]);
    expect(finalStep.micro).toEqual([]);
    expect(finalStep.macro).toEqual([]);
  });

  it("accumulates console output in truth order", () => {
    const steps = buildSim(fixtureTask, strings);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.out).toEqual(fixtureTask.truth);

    // вывод по ходу шагов только растёт и всегда является префиксом truth
    let previousLength = 0;
    for (const step of steps) {
      expect(step.out.length).toBeGreaterThanOrEqual(previousLength);
      expect(step.out).toEqual(fixtureTask.truth.slice(0, step.out.length));
      previousLength = step.out.length;
    }
  });

  it("queues the microtask before running it and drains microtasks before the timer", () => {
    const steps = buildSim(fixtureTask, strings);

    const microQueuedIndex = steps.findIndex((step) => step.micro.includes("B"));
    const microRunIndex = steps.findIndex((step) => step.out.includes("B"));
    const macroRunIndex = steps.findIndex((step) => step.out.includes("C"));
    expect(microQueuedIndex).toBeGreaterThanOrEqual(0);
    expect(microQueuedIndex).toBeLessThan(microRunIndex);
    expect(microRunIndex).toBeLessThan(macroRunIndex);
  });

  it("queues nested microtasks while their parent callback runs", () => {
    const steps = buildSim(fixtureTask, strings);
    const nestedQueuedStep = steps.find((step) => step.micro.includes("D"));
    expect(nestedQueuedStep).toBeDefined();
    expect(nestedQueuedStep?.out).toContain("C");
  });

  it("stays consistent for generated tasks", async () => {
    for (const level of ["easy", "medium", "hard"] as const) {
      const task = await generateTask(level);
      expect(task).not.toBeNull();
      if (!task) continue;

      const steps = buildSim(task, strings);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.out).toEqual(task.truth);
      expect(finalStep.micro).toEqual([]);
      expect(finalStep.macro).toEqual([]);
    }
  }, 15000);
});
