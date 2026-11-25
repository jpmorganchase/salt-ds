import { Step } from "@salt-ds/core";
import {
  CompactStep,
  CompactStepper,
  type CompactStepStage,
} from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as compactStepperStories from "~stories/compact-stepper/compact-stepper.stories";

const composedStories = composeStories(compactStepperStories);
const { Default, Progress, StageStatus } = composedStories;

function getGroup(index = 0) {
  return page.getByRole("group").nth(index).element();
}

function getText(index = 0) {
  return getGroup(index).textContent?.replace(/\s+/g, " ");
}

function getBarWidth(index = 0) {
  return getGroup(index).querySelector<HTMLElement>(".saltCompactStepper-bar")
    ?.style.width;
}

describe("GIVEN a CompactStepper", () => {
  checkAccessibility(composedStories);

  it("THEN renders a group named by aria-label", async () => {
    await renderWithSalt(<Default aria-label="Account setup progress" />);

    await expect
      .element(page.getByRole("group"))
      .toHaveAccessibleName("Account setup progress");
  });

  it.each([
    [0, "Step 1 of 4: Personal details", "25%"],
    [1, "Step 2 of 4: Payment details", "50%"],
    [2, "Step 3 of 4: Review", "75%"],
    [3, "Step 4 of 4: Confirmation", "100%"],
  ])(
    "THEN shows the active step without reading its state and fills the bar up to it, in stepper %i",
    async (index, text, width) => {
      await renderWithSalt(<Progress />);

      expect(getText(index)).toBe(text);
      expect(getBarWidth(index)).toBe(width);
    },
  );

  it.each([
    [0, "Step 2 of 4: Payment details, error"],
    [1, "Step 2 of 4: Payment details, warning"],
    [2, "Step 2 of 4: Payment details, locked"],
    [3, "Step 2 of 4: Payment details, error"],
  ])(
    "THEN reads the stage or status of the current step, in stepper %i",
    async (index, text) => {
      await renderWithSalt(<StageStatus />);

      expect(getText(index)).toBe(text);
      expect(getBarWidth(index)).toBe("50%");
    },
  );

  it.each<[string, CompactStepStage[], string, string]>([
    [
      "the first pending step WHEN no step is active or locked",
      ["completed", "pending", "pending", "pending"],
      "Step 2 of 4: Two, pending",
      "25%",
    ],
    [
      "the first step WHEN every step is pending",
      ["pending", "pending", "pending", "pending"],
      "Step 1 of 4: One, pending",
      "0%",
    ],
  ])("THEN shows %s as the current step", async (_, stages, text, width) => {
    const labels = ["One", "Two", "Three", "Four"];

    await renderWithSalt(
      <CompactStepper>
        {stages.map((stage, index) => (
          <CompactStep
            key={labels[index]}
            label={labels[index]}
            stage={stage}
          />
        ))}
      </CompactStepper>,
    );

    expect(getText()).toBe(text);
    expect(getBarWidth()).toBe(width);
  });

  it("THEN shows the first current step WHEN several steps are current", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      await renderWithSalt(
        <CompactStepper>
          <CompactStep label="One" stage="locked" />
          <CompactStep label="Two" stage="active" />
          <CompactStep label="Three" stage="active" />
        </CompactStepper>,
      );

      expect(getText()).toBe("Step 1 of 3: One, locked");
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("THEN reads steps inside fragments without warning", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      await renderWithSalt(
        <CompactStepper>
          <>
            <CompactStep label="One" stage="completed" />
            <>
              <CompactStep label="Two" stage="active" />
            </>
          </>
          {null}
          {false}
        </CompactStepper>,
      );

      expect(getText()).toBe("Step 2 of 2: Two");
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("THEN ignores children that aren't CompactStep elements, including Step", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      await renderWithSalt(
        <CompactStepper>
          text
          <CompactStep label="One" stage="active" />
          <Step label="Core" stage="active" />
          <div />
          <CompactStep label="Two" />
        </CompactStepper>,
      );

      expect(getText()).toBe("Step 1 of 2: One");
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("THEN warns WHEN a CompactStep is used outside a CompactStepper", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      await renderWithSalt(<CompactStep label="Alone" stage="active" />);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "<CompactStep /> should be used within a <CompactStepper />",
        ),
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  it.each<[string, ReactNode, string]>([
    [
      "there are no steps",
      null,
      "<CompactStepper /> should contain at least one <CompactStep />.",
    ],
    [
      "more than one step is current",
      <>
        <CompactStep label="One" stage="active" />
        <CompactStep label="Two" stage="locked" />
      </>,
      "<CompactStepper /> should contain only one",
    ],
    [
      "a child isn't a CompactStep",
      <>
        <CompactStep label="One" stage="active" />
        <div />
      </>,
      "<CompactStepper /> children should be <CompactStep /> elements.",
    ],
  ])("THEN warns WHEN %s", async (_, children, message) => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      await renderWithSalt(<CompactStepper>{children}</CompactStepper>);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(message));
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("THEN renders no text WHEN there are no steps", async () => {
    await renderWithSalt(<CompactStepper />);

    await expect.element(page.getByRole("group")).toBeInTheDocument();
    expect(getText()).toBe("");
  });
});
