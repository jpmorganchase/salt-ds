import { Step, Stepper } from "@salt-ds/core";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

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

    await page.getByRole("button", { name: "Step 1" }).click();

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

    await page.getByRole("button", { name: "Step 1" }).click();
    await expect
      .element(page.getByText("Step 1.1", { exact: true }))
      .toBeVisible();
    await expect
      .element(page.getByText("Step 1.1.1", { exact: true }))
      .not.toBeVisible();

    await page.getByRole("button", { name: "Step 1.1" }).click();
    await expect
      .element(page.getByText("Step 1.1.1", { exact: true }))
      .toBeVisible();
  });
});
