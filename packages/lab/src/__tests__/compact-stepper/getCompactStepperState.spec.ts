import { Step, type StepProps } from "@salt-ds/core";
import { createElement, Fragment, type ReactNode } from "react";
import { describe, expect, test } from "vitest";
import { getCompactStepperState } from "../../compact-stepper/internal/getCompactStepperState";

const step = (props: StepProps) => createElement(Step, props);

describe("getCompactStepperState", () => {
  test.each<[string, ReactNode[], string, number]>([
    [
      "the active step",
      [
        step({ label: "One", stage: "active" }),
        step({ label: "Two" }),
        step({ label: "Three" }),
        step({ label: "Four" }),
      ],
      "One",
      25,
    ],
    [
      "the first step that isn't completed WHEN no step is active",
      [
        step({ label: "One", stage: "completed" }),
        step({ label: "Two", stage: "locked" }),
        step({ label: "Three" }),
        step({ label: "Four" }),
      ],
      "Two",
      50,
    ],
    [
      "the last step WHEN every step is completed",
      [
        step({ label: "One", stage: "completed" }),
        step({ label: "Two", stage: "completed" }),
      ],
      "Two",
      100,
    ],
  ])("should use %s as the current step", (_, children, label, progress) => {
    const state = getCompactStepperState(children);

    expect(state.current?.label).toBe(label);
    expect(state.progress).toBe(progress);
  });

  test("should use the first active step and count the active steps WHEN several are active", () => {
    const state = getCompactStepperState([
      step({ label: "One", stage: "active" }),
      step({ label: "Two", stage: "active" }),
    ]);

    expect(state.current?.label).toBe("One");
    expect(state.activeCount).toBe(2);
  });

  test.each<[string, ReactNode]>([
    ["undefined", undefined],
    ["only null and false", [null, false]],
  ])("should have no current step WHEN children are %s", (_, children) => {
    const state = getCompactStepperState(children);

    expect(state.steps).toEqual([]);
    expect(state.current).toBeUndefined();
    expect(state.progress).toBe(0);
  });

  test("should read steps inside fragments", () => {
    const state = getCompactStepperState(
      createElement(
        Fragment,
        null,
        step({ label: "One", stage: "completed" }),
        createElement(Fragment, null, step({ label: "Two", stage: "active" })),
      ),
    );

    expect(state.steps).toHaveLength(2);
    expect(state.current?.label).toBe("Two");
    expect(state.hasNonStepChild).toBe(false);
  });

  test("should ignore children that aren't steps and flag them", () => {
    const state = getCompactStepperState([
      "text",
      step({ label: "One", stage: "active" }),
      createElement("div", { key: "div" }),
      step({ label: "Two" }),
    ]);

    expect(state.steps.map((s) => s.label)).toEqual(["One", "Two"]);
    expect(state.hasNonStepChild).toBe(true);
  });
});
