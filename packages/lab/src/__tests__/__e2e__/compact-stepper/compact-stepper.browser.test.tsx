import { Step, type StepStatus } from "@salt-ds/core";
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
const { Default } = composedStories;

function getText() {
  return page.getByRole("group").element().textContent?.replace(/\s+/g, " ");
}

function getBarWidth() {
  return page
    .getByRole("group")
    .element()
    .querySelector<HTMLElement>(".saltCompactStepper-bar")?.style.width;
}

describe("GIVEN a CompactStepper", () => {
  checkAccessibility(composedStories);

  it("THEN shows the position and label of the active step without reading its state", async () => {
    await renderWithSalt(<Default />);

    expect(getText()).toBe("Step 2 of 4: Payment details");
  });

  it("THEN renders a group named by aria-label", async () => {
    await renderWithSalt(<Default aria-label="Account setup progress" />);

    await expect
      .element(page.getByRole("group"))
      .toHaveAccessibleName("Account setup progress");
  });

  it.each<[CompactStepStage, StepStatus | undefined, string]>([
    ["active", "error", "Step 2 of 3: Two, error"],
    ["active", "warning", "Step 2 of 3: Two, warning"],
    ["locked", undefined, "Step 2 of 3: Two, locked"],
    ["locked", "error", "Step 2 of 3: Two, error"],
  ])(
    "THEN reads the state WHEN the current step is %s with status %s",
    async (stage, status, expected) => {
      await renderWithSalt(
        <CompactStepper>
          <CompactStep label="One" stage="completed" />
          <CompactStep label="Two" stage={stage} status={status} />
          <CompactStep label="Three" />
        </CompactStepper>,
      );

      expect(getText()).toBe(expected);
    },
  );

  it("THEN shows the first step as pending WHEN every step is pending", async () => {
    await renderWithSalt(
      <CompactStepper>
        <CompactStep label="One" />
        <CompactStep label="Two" />
        <CompactStep label="Three" />
      </CompactStepper>,
    );

    expect(getText()).toBe("Step 1 of 3: One, pending");
    expect(getBarWidth()).toBe("0%");
  });

  it.each<[string, CompactStepStage[], string, string]>([
    [
      "the active step",
      ["active", "pending", "pending", "pending"],
      "Step 1 of 4: One",
      "25%",
    ],
    [
      "the locked step",
      ["completed", "locked", "pending", "pending"],
      "Step 2 of 4: Two, locked",
      "50%",
    ],
    [
      "the last active step",
      ["completed", "completed", "completed", "active"],
      "Step 4 of 4: Four",
      "100%",
    ],
    [
      "the first pending step WHEN no step is active or locked",
      ["completed", "pending", "pending", "pending"],
      "Step 2 of 4: Two, pending",
      "25%",
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
