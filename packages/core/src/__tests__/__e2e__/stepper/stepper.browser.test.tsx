import { Step, Stepper } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as stepperStories from "~stories/stepper/stepper.stories";

const composedStories = composeStories(stepperStories);

describe("<Stepper />", () => {
  checkAccessibility(composedStories);

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
});
