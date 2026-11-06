import { Step, Stepper } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as stepperStories from "~stories/stepper/stepper.stories";

const { VerticalDepth1 } = composeStories(stepperStories);

describe("<Stepper />", () => {
  it("expands and collapses at depth one", async () => {
    await renderWithSalt(
      <Stepper orientation="vertical">
        <Step label="Step 1">
          <Step label="Step 1.1" />
          <Step label="Step 1.2" />
          <Step label="Step 1.3" />
        </Step>
      </Stepper>,
    );

    await expect
      .element(page.getByText("Step 1", { exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByText("Step 1.1", { exact: true }))
      .not.toBeVisible();

    await page
      .getByRole("button", { name: "Step 1 pending toggle substeps" })
      .click();

    await expect
      .element(page.getByText("Step 1", { exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByText("Step 1.1", { exact: true }))
      .toBeVisible();
  });

  it("expands and collapses at depth two", async () => {
    await renderWithSalt(
      <Stepper orientation="vertical">
        <Step label="Step 1">
          <Step label="Step 1.1">
            <Step label="Step 1.1.1" />
            <Step label="Step 1.1.2" />
            <Step label="Step 1.1.3" />
          </Step>
          <Step label="Step 1.2" />
          <Step label="Step 1.3" />
        </Step>
      </Stepper>,
    );

    await expect
      .element(page.getByText("Step 1", { exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByText("Step 1.1", { exact: true }))
      .not.toBeVisible();
    await expect
      .element(page.getByText("Step 1.1.1", { exact: true }))
      .not.toBeVisible();

    await page
      .getByRole("button", { name: "Step 1 pending toggle substeps" })
      .click();
    await expect
      .element(page.getByText("Step 1.1", { exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByText("Step 1.1.1", { exact: true }))
      .not.toBeVisible();

    await page
      .getByRole("button", { name: "Step 1.1 pending toggle substeps" })
      .click();
    await expect
      .element(page.getByText("Step 1.1.1", { exact: true }))
      .toBeVisible();
  });

  it("marks a step that contains the active step", async () => {
    await renderWithSalt(<VerticalDepth1 />);

    expect(document.getElementById("step-2")).toHaveClass(
      "saltStep-hasActiveStep",
    );
    expect(document.getElementById("step-1")).not.toHaveClass(
      "saltStep-hasActiveStep",
    );
    expect(document.getElementById("step-3")).not.toHaveClass(
      "saltStep-hasActiveStep",
    );
  });

  it("updates the step that contains the active step when it moves", async () => {
    const stepper = (moved: boolean) => (
      <Stepper orientation="vertical">
        <Step
          data-testid="step-1"
          label="Step 1"
          stage={moved ? "completed" : "inprogress"}
        >
          <Step label="Step 1.1" stage={moved ? "completed" : "active"} />
        </Step>
        <Step
          data-testid="step-2"
          label="Step 2"
          stage={moved ? "inprogress" : "pending"}
        >
          <Step label="Step 2.1" stage={moved ? "active" : "pending"} />
        </Step>
      </Stepper>
    );
    const { rerender } = await renderWithSalt(stepper(false));
    const step1 = page.getByTestId("step-1");
    const step2 = page.getByTestId("step-2");

    await expect.element(step1).toHaveClass("saltStep-hasActiveStep");
    await expect.element(step2).not.toHaveClass("saltStep-hasActiveStep");

    await rerender(stepper(true));

    await expect.element(step1).not.toHaveClass("saltStep-hasActiveStep");
    await expect.element(step2).toHaveClass("saltStep-hasActiveStep");
  });
});
