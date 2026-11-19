import type { StepStatus } from "@salt-ds/core";
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

describe("GIVEN a CompactStepper", () => {
  checkAccessibility(composedStories);

  it("THEN shows the position and label of the active step without reading its state", async () => {
    await renderWithSalt(<Default />);

    expect(getText()).toBe("Step 2 of 4: Payment details");
  });

  it("THEN renders a group named by aria-label", async () => {
    await renderWithSalt(<Default aria-label="Checkout progress" />);

    await expect
      .element(page.getByRole("group"))
      .toHaveAccessibleName("Checkout progress");
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

  it("THEN shows the last step as completed WHEN every step is completed", async () => {
    await renderWithSalt(
      <CompactStepper>
        <CompactStep label="One" stage="completed" />
        <CompactStep label="Two" stage="completed" />
        <CompactStep label="Three" stage="completed" />
      </CompactStepper>,
    );

    expect(getText()).toBe("Step 3 of 3: Three, completed");
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
