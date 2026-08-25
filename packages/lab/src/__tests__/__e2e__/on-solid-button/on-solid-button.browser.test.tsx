import { OnSolidButton } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as onSolidButtonStories from "~stories/on-solid-button/on-solid-button.stories";

const composedStories = composeStories(onSolidButtonStories);

describe("GIVEN an OnSolidButton", () => {
  checkAccessibility(composedStories);

  it("forwards a custom className", async () => {
    await renderWithSalt(
      <OnSolidButton className="custom-class">Dismiss</OnSolidButton>,
    );
    await expect
      .element(page.getByRole("button", { name: "Dismiss" }))
      .toHaveClass("custom-class");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    await renderWithSalt(
      <OnSolidButton onClick={onClick}>Dismiss</OnSolidButton>,
    );
    await page.getByRole("button", { name: "Dismiss" }).click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    await renderWithSalt(
      <OnSolidButton disabled onClick={onClick}>
        Dismiss
      </OnSolidButton>,
    );
    const button = page.getByRole("button", { name: "Dismiss" });
    await expect.element(button).toBeDisabled();
    await button.click({ force: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("is focusable but non-interactive with focusableWhenDisabled", async () => {
    const onClick = vi.fn();
    await renderWithSalt(
      <OnSolidButton disabled focusableWhenDisabled onClick={onClick}>
        Dismiss
      </OnSolidButton>,
    );
    const button = page.getByRole("button", { name: "Dismiss" });
    await expect.element(button).toHaveAttribute("aria-disabled", "true");
    await userEvent.tab();
    await expect.element(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await button.click({ force: true });
    expect(onClick).not.toHaveBeenCalled();
  });
});
